import { getFeatureFlags } from '$lib/server/config.js';

/**
 * Load feature flags once for the whole app. Child pages read them via `data.flags`.
 * Falls back to safe defaults if the DB is unavailable.
 */
export async function load() {
  const flags = await getFeatureFlags();
  return { flags };
}
