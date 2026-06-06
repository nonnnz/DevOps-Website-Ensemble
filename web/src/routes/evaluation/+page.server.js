import { prisma, safeQuery } from '$lib/server/db.js';
import { fallbackEvaluations } from '$lib/data/evaluation.js';

export async function load() {
  const rows = await safeQuery(
    () => prisma.evaluationResult.findMany({ orderBy: { created_at: 'asc' } }),
    [],
    'load evaluations'
  );
  return { evaluations: rows.length ? rows : fallbackEvaluations };
}
