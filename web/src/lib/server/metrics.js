/**
 * Lightweight runtime metrics helpers for the playground / chat API.
 * These are heuristic estimates good enough for a demo dashboard — the real
 * backend (vLLM / TGI) will report exact usage in real mode when available.
 */

/** @returns {string} a unique request id. */
export function newRequestId() {
  const rand = Math.random().toString(36).slice(2, 10);
  return `req_${Date.now().toString(36)}_${rand}`;
}

/**
 * Rough token estimate that works for mixed Thai + English text.
 * Thai has no spaces, so we approximate by characters.
 * @param {string} text
 * @returns {number}
 */
export function estimateTokens(text) {
  if (!text) return 0;
  const chars = text.trim().length;
  return Math.max(1, Math.round(chars / 3.5));
}

/**
 * Sum estimated input tokens across a messages array.
 * @param {Array<{role:string, content:string}>} messages
 * @returns {number}
 */
export function estimateInputTokens(messages) {
  return (messages || []).reduce((sum, m) => sum + estimateTokens(m?.content || ''), 0);
}

/**
 * @param {number} outputTokens
 * @param {number} latencyMs
 * @returns {number} tokens per second (rounded to 1 decimal)
 */
export function tokensPerSecond(outputTokens, latencyMs) {
  if (!latencyMs || latencyMs <= 0) return 0;
  return Math.round((outputTokens / (latencyMs / 1000)) * 10) / 10;
}

/** @returns {number} high-resolution-ish timestamp in ms. */
export function now() {
  return Date.now();
}
