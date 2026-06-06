import { prisma, safeQuery } from '$lib/server/db.js';
import { fallbackModels } from '$lib/data/models.js';

export async function load() {
  const models = await safeQuery(
    () => prisma.model.findMany({ where: { status: { not: 'disabled' } }, orderBy: { created_at: 'asc' } }),
    [],
    'load models'
  );
  return { models: models.length ? models : fallbackModels };
}
