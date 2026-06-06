/**
 * GET  /eval/{model_id}  — one model's eval (with overall)
 * POST /eval/{model_id}  — submit task scores for a model
 *
 * Body (flexible):
 *   { "name": "My Model", "tasks": { "exam": 71, "math": 58, "safe": 91 } }
 *   { "tasks": [ { "task": "exam", "score": 71 }, { "task": "math", "score": 58 } ] }
 *   { "task": "exam", "score": 71 }                       // single task
 *
 * Valid task keys: exam, math, inst, chat, trans, nlu, legal, safe (0–100).
 */
import { json, error } from '@sveltejs/kit';
import { getModel, upsert, parseScores, AXIS_KEYS } from '$lib/server/evalStore.js';

export function GET({ params }) {
  const model = getModel(params.model_id);
  if (!model) throw error(404, `No eval data for model "${params.model_id}".`);
  return json(model);
}

export async function POST({ params, request }) {
  let body;
  try {
    body = await request.json();
  } catch {
    throw error(400, 'Invalid JSON body.');
  }

  const scores = parseScores(body);
  if (Object.keys(scores).length === 0) {
    throw error(
      400,
      `No valid task scores found. Provide tasks keyed by: ${AXIS_KEYS.join(', ')} (values 0–100).`
    );
  }

  const name = typeof body.name === 'string' ? body.name.slice(0, 120) : undefined;
  const model = upsert(params.model_id, { name, scores });
  return json({ ok: true, model });
}
