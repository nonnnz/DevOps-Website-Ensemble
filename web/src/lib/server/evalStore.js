/**
 * Evaluation store for the Leaderboard + Capability Radar.
 *
 * Self-contained on purpose (file-backed + in-memory cache) so it does NOT touch
 * the shared Prisma schema / teammate's backend, and works even with no database.
 *
 * Data model:
 *   model -> { id, name, ours?, base?, scores: { <axisKey>: 0..100 }, updated_at }
 *
 * Submit results via:  POST /eval/{model_id}
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';

/** The 8 capability axes (tasks) used by the leaderboard + radar. */
export const AXES = [
  { key: 'exam', name: 'Exam (MCQ)' },
  { key: 'math', name: 'Math' },
  { key: 'inst', name: 'Instruct' },
  { key: 'chat', name: 'Chat/Gen' },
  { key: 'trans', name: 'Translate' },
  { key: 'nlu', name: 'NLU' },
  { key: 'legal', name: 'Legal RAG' },
  { key: 'safe', name: 'Safety' }
];
export const AXIS_KEYS = AXES.map((a) => a.key);

const STORE_PATH = path.resolve('eval-store.json');

/** Build a model record from an ordered score array (matches AXES order). */
function mk(id, name, arr, extra = {}) {
  const scores = {};
  AXIS_KEYS.forEach((k, i) => {
    scores[k] = arr[i];
  });
  return { id, name, scores, updated_at: new Date().toISOString(), ...extra };
}

/** Seed data (from the eval dashboard mock). */
const SEED = [
  mk('Qwen-Thai-SFT', 'Qwen-Thai-SFT', [71, 58, 74, 68, 82, 79, 55, 91], { ours: true }),
  mk('Qwen2.5-7B-base', 'Qwen2.5-7B (base)', [64, 55, 66, 55, 80, 74, 41, 84], { base: true }),
  mk('Typhoon2-8B', 'Typhoon2-8B', [74, 56, 70, 71, 78, 80, 58, 93]),
  mk('OpenThaiGPT-7B', 'OpenThaiGPT-7B', [66, 47, 61, 60, 75, 77, 49, 88]),
  mk('Sailor2-8B', 'Sailor2-8B', [69, 60, 67, 63, 84, 76, 52, 86])
];

/** @type {{models: Array<object>}|null} */
let cache = null;

function load() {
  if (cache) return cache;
  try {
    if (existsSync(STORE_PATH)) {
      cache = JSON.parse(readFileSync(STORE_PATH, 'utf-8'));
      return cache;
    }
  } catch (err) {
    console.warn('[evalStore] read failed, seeding fresh:', err?.message);
  }
  cache = { models: structuredClone(SEED) };
  persist();
  return cache;
}

function persist() {
  try {
    writeFileSync(STORE_PATH, JSON.stringify(cache, null, 2));
  } catch (err) {
    // Read-only FS (e.g. serverless): keep working from the in-memory cache.
    console.warn('[evalStore] write failed (in-memory only):', err?.message);
  }
}

/** Overall = rounded average of the axis scores that are present. */
export function computeOverall(scores) {
  const vals = AXIS_KEYS.map((k) => scores?.[k]).filter((v) => Number.isFinite(v));
  if (!vals.length) return 0;
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

function withOverall(m) {
  return { ...m, overall: computeOverall(m.scores) };
}

/** Map an arbitrary task label to a known axis key (by key or display name). */
export function resolveAxis(task) {
  if (task == null) return null;
  const t = String(task).trim().toLowerCase();
  const byKey = AXES.find((a) => a.key === t);
  if (byKey) return byKey.key;
  const byName = AXES.find((a) => a.name.toLowerCase() === t || a.name.split(' ')[0].toLowerCase() === t);
  return byName ? byName.key : null;
}

/**
 * Parse a flexible request body into a { axisKey: score } map.
 * Accepts: { tasks|scores: {exam: 71,...} } or [{task, score}] or single {task, score}.
 * @param {object} body
 */
export function parseScores(body = {}) {
  const out = {};
  const add = (task, score) => {
    const key = resolveAxis(task);
    if (!key) return;
    const n = Number(score);
    if (Number.isFinite(n)) out[key] = Math.min(100, Math.max(0, n));
  };

  const src = body.tasks ?? body.scores ?? body.results;
  if (Array.isArray(src)) {
    for (const r of src) add(r?.task ?? r?.name ?? r?.key, r?.score ?? r?.value);
  } else if (src && typeof src === 'object') {
    for (const [k, v] of Object.entries(src)) add(k, v);
  }
  if (body.task != null) add(body.task, body.score);
  return out;
}

/** Everything the dashboard needs. */
export function getAll() {
  const d = load();
  return {
    axes: AXES,
    models: d.models.map(withOverall)
  };
}

/** Get one model (with overall) or null. */
export function getModel(modelId) {
  const d = load();
  const m = d.models.find((x) => x.id === modelId);
  return m ? withOverall(m) : null;
}

/**
 * Create or update a model's task scores.
 * @param {string} modelId
 * @param {{ name?: string, scores: Record<string, number> }} payload
 */
export function upsert(modelId, { name, scores }) {
  const d = load();
  let m = d.models.find((x) => x.id === modelId);
  if (!m) {
    m = { id: modelId, name: name || modelId, scores: {}, updated_at: new Date().toISOString() };
    d.models.push(m);
  }
  if (name) m.name = name;
  m.scores = { ...m.scores, ...scores };
  m.updated_at = new Date().toISOString();
  persist();
  return withOverall(m);
}
