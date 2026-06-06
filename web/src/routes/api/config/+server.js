/**
 * GET  /api/config   -> { apiConfig (sanitized), featureFlags }
 * POST /api/config   -> update apiConfig and/or featureFlags
 *
 * SECURITY: a raw API key submitted here is NEVER stored. We only keep a masked
 * placeholder (api_key_placeholder). The real key must be set in env (LLM_API_KEY).
 */
import { json, error } from '@sveltejs/kit';
import { prisma, safeQuery } from '$lib/server/db.js';
import {
  getApiConfig,
  getFeatureFlags,
  sanitizeApiConfig,
  maskKey,
  envApiDefaults,
  defaultFlags
} from '$lib/server/config.js';
import {
  asString,
  asBool,
  clampNumber,
  oneOf,
  API_MODES,
  BACKENDS,
  SERVER_TYPES
} from '$lib/server/validate.js';

export async function GET() {
  const [apiConfig, featureFlags] = await Promise.all([getApiConfig(), getFeatureFlags()]);
  return json({ apiConfig: sanitizeApiConfig(apiConfig), featureFlags });
}

export async function POST({ request }) {
  let body;
  try {
    body = await request.json();
  } catch {
    throw error(400, 'Invalid JSON body');
  }

  const result = {};

  // --- API config ---------------------------------------------------------
  if (body.apiConfig) {
    const a = body.apiConfig;
    const current = await getApiConfig();

    // If the admin typed a raw key, store only a masked placeholder.
    let placeholder = current.api_key_placeholder || '';
    if (typeof a.api_key === 'string' && a.api_key.trim() && !a.api_key.includes('•')) {
      placeholder = maskKey(a.api_key.trim());
    } else if (typeof a.api_key_placeholder === 'string') {
      placeholder = a.api_key_placeholder;
    }

    const data = {
      mode: oneOf(a.mode, API_MODES, current.mode || 'mock'),
      default_backend: oneOf(a.default_backend, BACKENDS, current.default_backend || 'auto'),
      b200_endpoint: asString(a.b200_endpoint, 500),
      lanta_endpoint: asString(a.lanta_endpoint, 500),
      openai_base_url: asString(a.openai_base_url, 500),
      model_server_type: oneOf(a.model_server_type, SERVER_TYPES, current.model_server_type || 'vLLM'),
      api_key_placeholder: placeholder,
      timeout_seconds: clampNumber(a.timeout_seconds, 1, 600, current.timeout_seconds || 60),
      max_concurrent_requests: clampNumber(a.max_concurrent_requests, 1, 1024, current.max_concurrent_requests || 8),
      rate_limit_per_minute: clampNumber(a.rate_limit_per_minute, 1, 100000, current.rate_limit_per_minute || 60)
    };

    const existing = await safeQuery(() => prisma.apiConfig.findFirst(), null, 'find apiConfig');
    const saved = await safeQuery(
      () =>
        existing
          ? prisma.apiConfig.update({ where: { id: existing.id }, data })
          : prisma.apiConfig.create({ data }),
      null,
      'save apiConfig'
    );
    if (!saved) throw error(503, 'Database unavailable — API config not saved.');
    result.apiConfig = sanitizeApiConfig(saved);
  }

  // --- Feature flags ------------------------------------------------------
  if (body.featureFlags) {
    const f = body.featureFlags;
    const current = await getFeatureFlags();
    const data = {
      enable_playground: asBool(f.enable_playground, current.enable_playground),
      enable_streaming: asBool(f.enable_streaming, current.enable_streaming),
      enable_feedback: asBool(f.enable_feedback, current.enable_feedback),
      enable_gallery_prompts: asBool(f.enable_gallery_prompts, current.enable_gallery_prompts),
      enable_runtime_metrics: asBool(f.enable_runtime_metrics, current.enable_runtime_metrics),
      enable_public_api_docs: asBool(f.enable_public_api_docs, current.enable_public_api_docs),
      enable_webgl_mascot: asBool(f.enable_webgl_mascot, current.enable_webgl_mascot)
    };

    const existing = await safeQuery(() => prisma.featureFlag.findFirst(), null, 'find featureFlags');
    const saved = await safeQuery(
      () =>
        existing
          ? prisma.featureFlag.update({ where: { id: existing.id }, data })
          : prisma.featureFlag.create({ data }),
      null,
      'save featureFlags'
    );
    if (!saved) throw error(503, 'Database unavailable — feature flags not saved.');
    result.featureFlags = saved;
  }

  if (!result.apiConfig && !result.featureFlags) {
    throw error(400, 'Nothing to update: provide apiConfig and/or featureFlags.');
  }

  return json(result);
}
