/**
 * POST /api/chat
 *
 * Streams an assistant response as NDJSON (one JSON object per line):
 *   {"type":"meta",  request_id, backend, model, mode}
 *   {"type":"delta", content}            // repeated
 *   {"type":"error", message}            // only on failure
 *   {"type":"done",  request_id, playground_log_id, backend, model,
 *                    latency_ms, input_tokens, output_tokens,
 *                    tokens_per_second, status, error_message}
 *
 * Works for both stream on/off (stream off just sends one delta then done).
 * Every request is logged to playground_logs (best-effort; survives a DB outage).
 */
import { error } from '@sveltejs/kit';
import { prisma, safeQuery } from '$lib/server/db.js';
import { getApiConfig, resolveBackend, defaultModelId } from '$lib/server/config.js';
import { streamChat } from '$lib/server/llmClient.js';
import { agentLoopStream } from '$lib/server/agentLoop.js';
import {
  newRequestId,
  estimateInputTokens,
  estimateTokens,
  tokensPerSecond,
  now
} from '$lib/server/metrics.js';
import { clampGenParams, oneOf, asString, BACKENDS, asBool } from '$lib/server/validate.js';

const VALID_ROLES = ['system', 'user', 'assistant'];

export async function POST({ request }) {
  let body;
  try {
    body = await request.json();
  } catch {
    throw error(400, 'Invalid JSON body');
  }

  // --- validate messages (server-side, never trust client) ---------------
  const messages = (Array.isArray(body.messages) ? body.messages : [])
    .filter((m) => m && VALID_ROLES.includes(m.role) && typeof m.content === 'string')
    .map((m) => ({ role: m.role, content: asString(m.content, 8000) }))
    .filter((m) => m.content.trim().length > 0);

  if (messages.length === 0) {
    throw error(400, 'At least one message with content is required.');
  }

  const cfg = await getApiConfig();
  const requestedBackend = oneOf(body.backend, BACKENDS, cfg.default_backend || 'auto');
  const resolved = resolveBackend(requestedBackend, cfg);
  const modelId = asString(body.model, 120) || defaultModelId();
  const params = clampGenParams(body);
  const agentMode = asBool(body.agent_mode, false);

  const systemPrompt = messages.find((m) => m.role === 'system')?.content || null;
  const userPrompt = [...messages].reverse().find((m) => m.role === 'user')?.content || '';

  const requestId = newRequestId();
  const inputTokens = estimateInputTokens(messages);
  const startedAt = now();

  const encoder = new TextEncoder();
  let fullText = '';
  let statusStr = 'success';
  let errorMessage = null;

  const stream = new ReadableStream({
    async start(controller) {
      /** @param {object} obj */
      const send = (obj) => controller.enqueue(encoder.encode(JSON.stringify(obj) + '\n'));

      send({
        type: 'meta',
        request_id: requestId,
        backend: resolved.backend,
        model: modelId,
        mode: resolved.mode
      });

      try {
        if (agentMode && resolved.mode === 'real') {
          // Agentic loop: generator yields structured {type, content} objects
          const generator = agentLoopStream({
            apiStyle: resolved.apiStyle || 'chat',
            baseUrl: resolved.baseUrl,
            apiKey: resolved.apiKey,
            model: modelId,
            messages,
            params,
            timeoutSeconds: resolved.timeoutSeconds,
            systemOverride: asString(body.system_override, 2000) || undefined
          });

          for await (const event of generator) {
            if (event.type === 'delta') {
              fullText += event.content;
              send({ type: 'delta', content: event.content });
            } else if (event.type === 'thinking') {
              send({ type: 'thinking', content: event.content });
            } else if (event.type === 'thinking_retry') {
              send({ type: 'thinking_retry', iteration: event.iteration, reason: event.reason });
            }
          }
        } else {
          // Standard path
          const generator = streamChat({
            mode: resolved.mode,
            apiStyle: resolved.apiStyle,
            userPrompt,
            messages,
            params,
            baseUrl: resolved.baseUrl,
            apiKey: resolved.apiKey,
            model: modelId,
            timeoutSeconds: resolved.timeoutSeconds
          });

          for await (const delta of generator) {
            if (!delta) continue;
            fullText += delta;
            send({ type: 'delta', content: delta });
          }
        }
      } catch (err) {
        statusStr = 'error';
        errorMessage = err?.message || 'Inference request failed.';
        console.error('[api/chat] inference error:', errorMessage);
        send({ type: 'error', message: errorMessage });
      }

      const latencyMs = now() - startedAt;
      const outputTokens = estimateTokens(fullText);
      const tps = tokensPerSecond(outputTokens, latencyMs);

      // Persist the log (best-effort — never break the response if DB is down).
      const log = await safeQuery(
        () =>
          prisma.playgroundLog.create({
            data: {
              request_id: requestId,
              model_id: modelId,
              backend: resolved.backend,
              system_prompt: systemPrompt,
              user_prompt: userPrompt,
              assistant_response: fullText,
              temperature: params.temperature,
              top_p: params.top_p,
              max_tokens: params.max_tokens,
              repetition_penalty: params.repetition_penalty,
              stream: params.stream,
              latency_ms: latencyMs,
              input_tokens: inputTokens,
              output_tokens: outputTokens,
              tokens_per_second: tps,
              status: statusStr,
              error_message: errorMessage
            }
          }),
        null,
        'create playgroundLog'
      );

      send({
        type: 'done',
        request_id: requestId,
        playground_log_id: log?.id ?? null,
        backend: resolved.backend,
        model: modelId,
        latency_ms: latencyMs,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        tokens_per_second: tps,
        status: statusStr,
        error_message: errorMessage
      });

      controller.close();
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no'
    }
  });
}
