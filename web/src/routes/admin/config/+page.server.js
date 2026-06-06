import { prisma, safeQuery } from '$lib/server/db.js';
import { getApiConfig, getFeatureFlags, sanitizeApiConfig } from '$lib/server/config.js';
import { fallbackModels } from '$lib/data/models.js';

/**
 * Admin config data loader.
 * TODO (security): this page has no auth yet. Before exposing publicly, guard it
 * in src/hooks.server.js (e.g. session / basic auth) for any /admin/* path.
 */
export async function load() {
  const [apiConfig, featureFlags, models] = await Promise.all([
    getApiConfig(),
    getFeatureFlags(),
    safeQuery(() => prisma.model.findMany({ orderBy: { created_at: 'asc' } }), [], 'admin models')
  ]);

  return {
    apiConfig: sanitizeApiConfig(apiConfig),
    featureFlags,
    models: models.length ? models : fallbackModels
  };
}
