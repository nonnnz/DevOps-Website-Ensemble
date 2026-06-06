import { prisma, safeQuery } from '$lib/server/db.js';
import { fallbackEvaluations } from '$lib/data/evaluation.js';
import { getAll } from '$lib/server/evalStore.js';

export async function load() {
  const rows = await safeQuery(
    () => prisma.evaluationResult.findMany({ orderBy: { created_at: 'asc' } }),
    [],
    'load evaluations'
  );
  return {
    evaluations: rows.length ? rows : fallbackEvaluations,
    // Leaderboard + Capability Radar dataset (see /eval API).
    evalBoard: getAll()
  };
}
