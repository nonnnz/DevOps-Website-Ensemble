/**
 * Runtime configuration resolution.
 *
 * Config comes from two places:
 *   1. Environment variables  (secrets + deploy defaults) — see .env.example
 *   2. The api_configs / feature_flags DB rows (editable in /admin/config)
 *
 * SECURITY: the real inference API key is ONLY read from env (LLM_API_KEY) and
 * never returned to the client or stored in the DB. The DB only keeps a masked
 * placeholder for display.
 */
import { env } from '$env/dynamic/private';
import { prisma, safeQuery } from './db.js';

/** Defaults derived from environment variables (used when DB row is missing). */
export function envApiDefaults() {
  return {
    mode: env.LLM_API_MODE || 'mock',
    default_backend: env.DEFAULT_BACKEND || 'auto',
    b200_endpoint: env.B200_ENDPOINT_URL || '',
    lanta_endpoint: env.LANTA_ENDPOINT_URL || '',
    local_endpoint: env.LOCAL_ENDPOINT_URL || 'http://localhost:8000',
    openai_base_url: env.LLM_API_BASE_URL || '',
    model_server_type: 'vLLM',
    api_key_placeholder: maskKey(env.LLM_API_KEY || ''),
    timeout_seconds: 60,
    max_concurrent_requests: 8,
    rate_limit_per_minute: 60
  };
}

/** Default feature flags (all on). enable_webgl_mascot controls the 3D mascot. */
export function defaultFlags() {
  return {
    enable_playground: true,
    enable_streaming: true,
    enable_feedback: true,
    enable_gallery_prompts: true,
    enable_runtime_metrics: true,
    enable_public_api_docs: true,
    enable_webgl_mascot: true
  };
}

/**
 * Mask a secret so it can be shown in the UI without leaking it.
 * @param {string} key
 * @returns {string}
 */
export function maskKey(key) {
  if (!key) return '';
  if (key.length <= 8) return '••••';
  return `${key.slice(0, 3)}••••${key.slice(-4)}`;
}

/**
 * Get the API config row (or env-based defaults if the DB is empty/down).
 * @returns {Promise<object>}
 */
export async function getApiConfig() {
  const row = await safeQuery(
    () => prisma.apiConfig.findFirst({ orderBy: { created_at: 'asc' } }),
    null,
    'getApiConfig'
  );
  return row ?? envApiDefaults();
}

/**
 * Get the feature flags row (or defaults if the DB is empty/down).
 * @returns {Promise<object>}
 */
export async function getFeatureFlags() {
  const row = await safeQuery(
    () => prisma.featureFlag.findFirst({ orderBy: { created_at: 'asc' } }),
    null,
    'getFeatureFlags'
  );
  return row ?? defaultFlags();
}

/**
 * Return an API config safe to send to the browser (never contains the real key).
 * @param {object} cfg
 */
export function sanitizeApiConfig(cfg) {
  if (!cfg) return cfg;
  const { ...rest } = cfg;
  // api_key_placeholder is already masked; ensure no raw key field ever leaks.
  delete rest.api_key;
  return rest;
}

/**
 * Resolve the concrete backend + endpoint to call for a chat request.
 *
 * @param {string|undefined} requestedBackend  'auto' | 'b200' | 'lanta'
 * @param {object} cfg  api config row
 * @returns {{ mode:string, backend:string, baseUrl:string, apiKey:string, timeoutSeconds:number }}
 */
export function resolveBackend(requestedBackend, cfg) {
  const mode = cfg.mode || 'mock';
  let backend = requestedBackend || cfg.default_backend || 'auto';

  if (backend === 'auto') {
    // Prefer B200, fall back to LANTA. Tune this policy for your infra.
    backend = 'b200';
  }

  // Per-backend endpoint, falling back to the generic OpenAI-compatible base URL.
  let baseUrl = '';
  if (backend === 'b200') {
    baseUrl = cfg.b200_endpoint || env.B200_ENDPOINT_URL || cfg.openai_base_url || env.LLM_API_BASE_URL || '';
  } else if (backend === 'lanta') {
    baseUrl = cfg.lanta_endpoint || env.LANTA_ENDPOINT_URL || cfg.openai_base_url || env.LLM_API_BASE_URL || '';
  } else if (backend === 'local') {
    baseUrl = cfg.local_endpoint || env.LOCAL_ENDPOINT_URL || 'http://localhost:8000';
  } else {
    baseUrl = cfg.openai_base_url || env.LLM_API_BASE_URL || '';
  }

  return {
    mode,
    backend,
    baseUrl: baseUrl.replace(/\/$/, ''),
    // SECURITY: real key only from env, never from DB / client.
    apiKey: env.LLM_API_KEY || '',
    timeoutSeconds: cfg.timeout_seconds || 60
  };
}

/** Default model id from env (used when a request omits it). */
export function defaultModelId() {
  return env.DEFAULT_MODEL_ID || 'thai-llm-chat-v0.1';
}
