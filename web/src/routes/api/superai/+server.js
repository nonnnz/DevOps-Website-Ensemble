/**
 * POST /api/superai
 *
 * Isolated adapter for the SuperAI LLM API (https://spaiss6.pangpuriye.info).
 * That API is a simple causal-LM infer endpoint (POST /api/infer, prompt -> output,
 * non-streaming) — NOT OpenAI-compatible. This route bridges it to the same NDJSON
 * protocol the playground already speaks (meta -> delta... -> done), and simulates
 * streaming for a nicer UX.
 *
 * Kept as a separate file on purpose so it does not touch the existing /api/chat,
 * llmClient.js or config.js (backend owned by another teammate).
 */
import { error } from '@sveltejs/kit';
import { prisma, safeQuery } from '$lib/server/db.js';
import { newRequestId, estimateTokens, tokensPerSecond, now } from '$lib/server/metrics.js';
import { clampGenParams, asString } from '$lib/server/validate.js';

const SUPERAI_INFER_URL = 'https://spaiss6.pangpuriye.info/api/infer';
const VALID_ROLES = ['system', 'user', 'assistant'];

/**
 * Flatten a chat message array into a single prompt for the causal LM.
 * @param {Array<{role:string, content:string}>} messages
 * @returns {string}
 */
function buildPrompt(messages) {
  const system = messages.find((m) => m.role === 'system')?.content;
  const turns = messages.filter((m) => m.role !== 'system');
  let prompt = system ? `${system.trim()}\n\n` : '';
  for (const m of turns) {
    prompt += `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content.trim()}\n`;
  }
  prompt += 'Assistant:';
  return prompt;
}

export async function POST({ request }) {
  let body;
  try {
    body = await request.json();
  } catch {
    throw error(400, 'Invalid JSON body');
  }

  const messages = (Array.isArray(body.messages) ? body.messages : [])
    .filter((m) => m && VALID_ROLES.includes(m.role) && typeof m.content === 'string')
    .map((m) => ({ role: m.role, content: asString(m.content, 8000) }))
    .filter((m) => m.content.trim().length > 0);

  // Accept either a raw prompt or a chat messages array.
  let prompt = asString(body.prompt, 8000);
  if (!prompt && messages.length) prompt = buildPrompt(messages);
  if (!prompt.trim()) throw error(400, 'prompt or messages is required.');

  const params = clampGenParams(body);
  const maxNewTokens = Math.min(4096, Math.max(1, params.max_tokens));
  // Model id chosen in the playground (the infer API itself loads a fixed local
  // model, so this is used for display/logging only).
  const modelId = asString(body.model, 200) || 'superai-llm';

  const systemPrompt = messages.find((m) => m.role === 'system')?.content || null;
  const userPrompt =
    messages.filter((m) => m.role === 'user').pop()?.content || prompt;

  const requestId = newRequestId();
  const startedAt = now();

  const encoder = new TextEncoder();
  let fullText = '';
  let statusStr = 'success';
  let errorMessage = null;
  let promptTokens = 0;
  let completionTokens = 0;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj) => controller.enqueue(encoder.encode(JSON.stringify(obj) + '\n'));

      send({ type: 'meta', request_id: requestId, backend: 'superai', model: modelId, mode: 'real' });

      try {
        console.log(`[api/superai] -> POST ${SUPERAI_INFER_URL} (model=${modelId}, max_new_tokens=${maxNewTokens})`);
        const res = await fetch(SUPERAI_INFER_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            max_new_tokens: maxNewTokens,
            temperature: params.temperature,
            top_p: params.top_p,
            do_sample: typeof body.do_sample === 'boolean' ? body.do_sample : params.temperature > 0
          })
        });

        if (!res.ok) {
          const detail = await res.text().catch(() => '');
          // Keep the raw upstream detail in the server log for debugging...
          console.error('[api/superai] upstream error', res.status, detail.slice(0, 400));
          // ...but show users a clean, actionable message.
          if (res.status === 503) {
            throw new Error(
              'SuperAI model is not ready on the inference server (it could not load its tokenizer/weights). This is an upstream issue — try again later, or switch Backend to "Auto" to use the demo.'
            );
          }
          throw new Error(`SuperAI request failed (HTTP ${res.status}). Please try again later.`);
        }

        const data = await res.json();
        fullText = (data.output ?? '').toString();
        promptTokens = Number(data.prompt_tokens) || 0;
        completionTokens = Number(data.completion_tokens) || 0;

        // The API is non-streaming; chunk the output so the UI feels live.
        if (params.stream !== false && fullText) {
          const chunkSize = 3;
          for (let i = 0; i < fullText.length; i += chunkSize) {
            send({ type: 'delta', content: fullText.slice(i, i + chunkSize) });
            await new Promise((r) => setTimeout(r, 12));
          }
        } else {
          send({ type: 'delta', content: fullText });
        }
      } catch (err) {
        statusStr = 'error';
        errorMessage = err?.message || 'SuperAI inference failed.';
        console.error('[api/superai]', errorMessage);
        send({ type: 'error', message: errorMessage });
      }

      const latencyMs = now() - startedAt;
      const inputTokens = promptTokens || estimateTokens(prompt);
      const outputTokens = completionTokens || estimateTokens(fullText);
      const tps = tokensPerSecond(outputTokens, latencyMs);

      // Best-effort log (reuses existing schema; safe if DB is down).
      const log = await safeQuery(
        () =>
          prisma.playgroundLog.create({
            data: {
              request_id: requestId,
              model_id: modelId,
              backend: 'superai',
              system_prompt: systemPrompt,
              user_prompt: userPrompt,
              assistant_response: fullText,
              temperature: params.temperature,
              top_p: params.top_p,
              max_tokens: maxNewTokens,
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
        'superai log'
      );

      send({
        type: 'done',
        request_id: requestId,
        playground_log_id: log?.id ?? null,
        backend: 'superai',
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
      'Cache-Control': 'no-cache, no-transform'
    }
  });
}
