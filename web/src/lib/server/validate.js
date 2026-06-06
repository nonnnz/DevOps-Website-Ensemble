/**
 * Tiny server-side validation helpers.
 * Per fullstack-guardian: never trust the client — every API route coerces and
 * clamps input here before it touches the DB or the inference backend.
 */

/**
 * @param {*} value
 * @param {number} min
 * @param {number} max
 * @param {number} fallback
 * @returns {number}
 */
export function clampNumber(value, min, max, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

/**
 * @param {*} value
 * @param {string[]} allowed
 * @param {string} fallback
 * @returns {string}
 */
export function oneOf(value, allowed, fallback) {
  return allowed.includes(value) ? value : fallback;
}

/**
 * @param {*} value
 * @param {boolean} fallback
 * @returns {boolean}
 */
export function asBool(value, fallback = false) {
  if (typeof value === 'boolean') return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return fallback;
}

/**
 * @param {*} value
 * @param {number} maxLen
 * @param {string} fallback
 * @returns {string}
 */
export function asString(value, maxLen = 2000, fallback = '') {
  if (value == null) return fallback;
  return String(value).slice(0, maxLen);
}

/**
 * Clamp generation parameters from a chat request to safe ranges.
 * @param {object} body
 */
export function clampGenParams(body = {}) {
  return {
    temperature: clampNumber(body.temperature, 0, 2, 0.7),
    top_p: clampNumber(body.top_p, 0, 1, 0.95),
    max_tokens: clampNumber(body.max_tokens, 1, 8192, 1024),
    repetition_penalty: clampNumber(body.repetition_penalty, 0.5, 2, 1.1),
    stream: asBool(body.stream, true)
  };
}

export const BACKENDS = ['auto', 'b200', 'lanta'];
export const FEEDBACK_TYPES = ['good', 'bad', 'hallucination', 'unsafe'];
export const MODEL_STATUSES = ['active', 'hidden', 'disabled'];
export const MODEL_TYPES = ['base', 'instruct', 'chat'];
export const SERVER_TYPES = ['vLLM', 'TGI', 'Triton', 'Custom'];
export const API_MODES = ['mock', 'real'];
