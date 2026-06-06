/**
 * Agentic think → respond loop for small Thai models.
 *
 * Each iteration:
 *   1. Call model (non-streaming) → collect full raw output
 *   2. Parse <คิด>…</คิด> and <ตอบ>…</ตอบ> tags
 *   3. Validate response quality (Thai chars, length, repetition guard)
 *   4. Good → emit thinking event + pseudo-stream the response
 *      Bad + iterations left → emit thinking_retry + retry with hint
 *
 * Yields structured NDJSON-compatible objects (not raw strings):
 *   { type: 'thinking',       content, iteration }
 *   { type: 'thinking_retry', iteration, reason }
 *   { type: 'delta',          content }
 */

import { realStream, completionsStream } from './llmClient.js';
import { THAI_AGENT_SYSTEM, retryHint } from './systemPrompts.js';

const MAX_ITER = 3;
const THINK_OPEN   = '<คิด>';
const THINK_CLOSE  = '</คิด>';
const RESPOND_OPEN  = '<ตอบ>';
const RESPOND_CLOSE = '</ตอบ>';
const STREAM_CHUNK  = 3;   // chars per pseudo-stream chunk
const STREAM_DELAY  = 8;   // ms between chunks

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── tag helpers ───────────────────────────────────────────────────────────────

function between(text, open, close) {
  const s = text.indexOf(open);
  if (s === -1) return '';
  const inner = text.slice(s + open.length);
  const e = inner.indexOf(close);
  return (e === -1 ? inner : inner.slice(0, e)).trim();
}

// ── guardrail validators ──────────────────────────────────────────────────────

function hasThai(text) {
  return /[฀-๿]/.test(text);
}

function hasExcessRepetition(text) {
  // Any 6+ char sequence repeated 4+ times in a row = looping model
  return /(.{6,})\1{4,}/.test(text);
}

function validate(text) {
  const t = text?.trim() ?? '';
  if (t.length < 5)            return { ok: false, reason: 'คำตอบสั้นเกินไป' };
  if (!hasThai(t))             return { ok: false, reason: 'ไม่มีภาษาไทย' };
  if (hasExcessRepetition(t))  return { ok: false, reason: 'ข้อความวนซ้ำ' };
  return { ok: true };
}

// ── message builders ──────────────────────────────────────────────────────────

function withAgentSystem(messages, system) {
  return [
    { role: 'system', content: system },
    ...messages.filter((m) => m.role !== 'system')
  ];
}

// ── core loop ─────────────────────────────────────────────────────────────────

/**
 * @param {object}  args
 * @param {'chat'|'completions'} args.apiStyle
 * @param {string}  args.baseUrl
 * @param {string}  args.apiKey
 * @param {string}  args.model
 * @param {Array<{role:string,content:string}>} args.messages
 * @param {object}  args.params        generation params
 * @param {number}  args.timeoutSeconds
 * @param {string}  [args.systemOverride]   replace default agent system prompt
 * @returns {AsyncGenerator<object>}
 */
export async function* agentLoopStream(args) {
  const { apiStyle, baseUrl, apiKey, model, params, timeoutSeconds, systemOverride } = args;

  const callModel = (msgs, p) =>
    apiStyle === 'completions'
      ? completionsStream({ baseUrl, apiKey, model, messages: msgs, params: p, timeoutSeconds })
      : realStream({ baseUrl, apiKey, model, messages: msgs, params: p, timeoutSeconds });

  // Always non-streaming internally so we can validate before emitting
  const batchParams = { ...params, stream: false };

  let system   = systemOverride || THAI_AGENT_SYSTEM;
  let thought   = '';
  let response  = '';

  for (let iter = 1; iter <= MAX_ITER; iter++) {
    const msgs = withAgentSystem(args.messages, system);

    let raw = '';
    for await (const chunk of callModel(msgs, batchParams)) {
      raw += chunk;
    }

    thought  = between(raw, THINK_OPEN, THINK_CLOSE);
    response = between(raw, RESPOND_OPEN, RESPOND_CLOSE);

    if (!response) {
      // Model ignored format tags — strip any partial tags and use raw output
      response = raw
        .replace(THINK_OPEN, '').replace(THINK_CLOSE, '')
        .replace(RESPOND_OPEN, '').replace(RESPOND_CLOSE, '')
        .trim();
    }

    const { ok, reason } = validate(response);
    if (ok || iter === MAX_ITER) break;

    yield { type: 'thinking_retry', iteration: iter, reason };
    system = (systemOverride || THAI_AGENT_SYSTEM) + retryHint(reason);
  }

  // Emit thinking block (client shows it collapsed by default)
  if (thought) yield { type: 'thinking', content: thought };

  // Pseudo-stream the response for smooth UX
  for (let i = 0; i < response.length; i += STREAM_CHUNK) {
    yield { type: 'delta', content: response.slice(i, i + STREAM_CHUNK) };
    await sleep(STREAM_DELAY);
  }
}
