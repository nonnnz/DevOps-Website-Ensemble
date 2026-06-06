/**
 * POST /api/status/test  body: { backend: 'b200' | 'lanta' | 'chat' }
 *
 * Tests connectivity to an inference backend and records the result.
 *   - mock mode : returns a simulated "online" result (no external calls)
 *   - real mode : pings the OpenAI-compatible endpoint (GET /v1/models) or
 *                 runs a tiny chat completion ('chat' test)
 *
 * Returns: { status: online|offline|degraded, latency_ms, error_message }
 */
import { json, error } from '@sveltejs/kit';
import { prisma, safeQuery } from '$lib/server/db.js';
import { getApiConfig, resolveBackend, defaultModelId } from '$lib/server/config.js';
import { now } from '$lib/server/metrics.js';
import { oneOf } from '$lib/server/validate.js';

const TEST_TARGETS = ['b200', 'lanta', 'chat'];
const SLOW_MS = 2000;

/** @param {string} baseUrl @param {string} apiKey @param {number} timeoutMs */
async function pingModels(baseUrl, apiKey, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const startedAt = now();
  try {
    const res = await fetch(`${baseUrl}/v1/models`, {
      headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
      signal: controller.signal
    });
    const latency = now() - startedAt;
    if (!res.ok) {
      return { status: 'offline', latency_ms: latency, error_message: `HTTP ${res.status}` };
    }
    return { status: latency > SLOW_MS ? 'degraded' : 'online', latency_ms: latency, error_message: null };
  } catch (err) {
    return { status: 'offline', latency_ms: now() - startedAt, error_message: err?.message || 'connection failed' };
  } finally {
    clearTimeout(timer);
  }
}

/** @param {string} baseUrl @param {string} apiKey @param {string} model @param {number} timeoutMs */
async function pingChat(baseUrl, apiKey, model, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const startedAt = now();
  try {
    const res = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}) },
      body: JSON.stringify({ model, messages: [{ role: 'user', content: 'ping' }], max_tokens: 1, stream: false }),
      signal: controller.signal
    });
    const latency = now() - startedAt;
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      return { status: 'offline', latency_ms: latency, error_message: `HTTP ${res.status} ${detail.slice(0, 120)}` };
    }
    return { status: latency > SLOW_MS ? 'degraded' : 'online', latency_ms: latency, error_message: null };
  } catch (err) {
    return { status: 'offline', latency_ms: now() - startedAt, error_message: err?.message || 'connection failed' };
  } finally {
    clearTimeout(timer);
  }
}

export async function POST({ request }) {
  let body;
  try {
    body = await request.json();
  } catch {
    throw error(400, 'Invalid JSON body');
  }

  const target = oneOf(body.backend, TEST_TARGETS, '');
  if (!target) throw error(400, `backend must be one of: ${TEST_TARGETS.join(', ')}`);

  const cfg = await getApiConfig();
  const timeoutMs = Math.min((cfg.timeout_seconds || 60) * 1000, 15000);

  let result;

  if (cfg.mode === 'mock') {
    // Simulated result so the panel works with zero external infra.
    const latency = target === 'chat' ? 380 + Math.floor(Math.random() * 120) : 30 + Math.floor(Math.random() * 60);
    result = { status: 'online', latency_ms: latency, error_message: null };
  } else if (target === 'chat') {
    const resolved = resolveBackend(cfg.default_backend, cfg);
    if (!resolved.baseUrl) {
      result = { status: 'offline', latency_ms: 0, error_message: 'No endpoint configured.' };
    } else {
      result = await pingChat(resolved.baseUrl, resolved.apiKey, defaultModelId(), timeoutMs);
    }
  } else {
    const resolved = resolveBackend(target, cfg);
    if (!resolved.baseUrl) {
      result = { status: 'offline', latency_ms: 0, error_message: `No ${target.toUpperCase()} endpoint configured.` };
    } else {
      result = await pingModels(resolved.baseUrl, resolved.apiKey, timeoutMs);
    }
  }

  // Record the check (best-effort).
  await safeQuery(
    () =>
      prisma.statusCheck.create({
        data: {
          backend: target,
          status: result.status,
          latency_ms: result.latency_ms,
          error_message: result.error_message
        }
      }),
    null,
    'create statusCheck'
  );

  return json({ backend: target, ...result });
}
