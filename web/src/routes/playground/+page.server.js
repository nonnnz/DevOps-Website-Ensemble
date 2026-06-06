import { prisma, safeQuery } from '$lib/server/db.js';
import { getApiConfig, sanitizeApiConfig, defaultModelId } from '$lib/server/config.js';
import { fallbackModels } from '$lib/data/models.js';

export async function load({ url }) {
  const [models, apiConfig] = await Promise.all([
    safeQuery(
      () => prisma.model.findMany({ where: { status: { not: 'disabled' } }, orderBy: { created_at: 'asc' } }),
      [],
      'playground models'
    ),
    getApiConfig()
  ]);

  return {
    models: models.length ? models : fallbackModels,
    apiConfig: sanitizeApiConfig(apiConfig),
    defaultModelId: defaultModelId(),
    // Pre-fill support: /playground?prompt=...&model=...
    initialPrompt: url.searchParams.get('prompt') || '',
    initialModel: url.searchParams.get('model') || ''
  };
}
