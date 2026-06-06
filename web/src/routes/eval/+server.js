/**
 * GET /eval — full leaderboard + radar dataset:
 *   { axes: [{key,name}], models: [{ id, name, ours?, base?, scores, overall }] }
 */
import { json } from '@sveltejs/kit';
import { getAll } from '$lib/server/evalStore.js';

export function GET() {
  return json(getAll());
}
