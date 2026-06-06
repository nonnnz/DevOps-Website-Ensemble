/**
 * GET  /api/models        -> list models (?all=1 to include hidden/disabled)
 * POST /api/models        -> create or update a model (admin / model config)
 */
import { json, error } from '@sveltejs/kit';
import { prisma, safeQuery } from '$lib/server/db.js';
import {
  asString,
  clampNumber,
  asBool,
  oneOf,
  MODEL_STATUSES,
  MODEL_TYPES
} from '$lib/server/validate.js';

export async function GET({ url }) {
  const includeAll = url.searchParams.get('all') === '1';
  const where = includeAll ? {} : { status: { not: 'disabled' } };
  const models = await safeQuery(
    () => prisma.model.findMany({ where, orderBy: { created_at: 'asc' } }),
    [],
    'list models'
  );
  return json({ models });
}

export async function POST({ request }) {
  let body;
  try {
    body = await request.json();
  } catch {
    throw error(400, 'Invalid JSON body');
  }

  const modelId = asString(body.model_id, 120).trim();
  if (!modelId) throw error(400, 'model_id is required.');

  const data = {
    model_id: modelId,
    display_name: asString(body.display_name, 200) || modelId,
    model_type: oneOf(body.model_type, MODEL_TYPES, 'chat'),
    parameters: asString(body.parameters, 40) || '8B',
    context_length: clampNumber(body.context_length, 256, 1_048_576, 8192),
    max_output_tokens: clampNumber(body.max_output_tokens, 16, 131_072, 2048),
    status: oneOf(body.status, MODEL_STATUSES, 'active'),
    license: asString(body.license, 80) || 'Apache-2.0',
    hf_url: asString(body.hf_url, 500) || null,
    download_url: asString(body.download_url, 500) || null,
    supports_b200: asBool(body.supports_b200, true),
    supports_lanta: asBool(body.supports_lanta, true)
  };

  const saved = await safeQuery(
    () =>
      prisma.model.upsert({
        where: { model_id: modelId },
        update: data,
        create: data
      }),
    null,
    'upsert model'
  );

  if (!saved) throw error(503, 'Database unavailable — model not saved.');
  return json({ model: saved });
}
