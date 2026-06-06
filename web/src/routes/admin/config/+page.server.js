import { prisma, safeQuery } from '$lib/server/db.js';
import { getApiConfig, getFeatureFlags, sanitizeApiConfig } from '$lib/server/config.js';
import { fallbackModels } from '$lib/data/models.js';

/**
 * Admin config data loader.
 * Auth is enforced in src/hooks.server.js — this loader only runs for requests
 * that already passed the admin gate (valid ADMIN_TOKEN cookie/header, or dev
 * with ADMIN_TOKEN unset).
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
