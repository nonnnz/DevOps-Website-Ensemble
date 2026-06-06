/**
 * POST /api/feedback  -> save feedback for a playground log
 * GET  /api/feedback  -> counts + recent rows (?model=&backend=&type=)
 */
import { json, error } from '@sveltejs/kit';
import { prisma, safeQuery } from '$lib/server/db.js';
import { asString, oneOf, FEEDBACK_TYPES } from '$lib/server/validate.js';

export async function POST({ request }) {
  let body;
  try {
    body = await request.json();
  } catch {
    throw error(400, 'Invalid JSON body');
  }

  const feedbackType = oneOf(body.feedback_type, FEEDBACK_TYPES, '');
  if (!feedbackType) {
    throw error(400, `feedback_type must be one of: ${FEEDBACK_TYPES.join(', ')}`);
  }

  const data = {
    playground_log_id: asString(body.playground_log_id, 60) || null,
    feedback_type: feedbackType,
    comment: asString(body.comment, 1000) || null
  };

  const saved = await safeQuery(
    () => prisma.feedback.create({ data }),
    null,
    'create feedback'
  );
  if (!saved) throw error(503, 'Database unavailable — feedback not saved.');

  return json({ ok: true, feedback: saved });
}

export async function GET({ url }) {
  const modelId = url.searchParams.get('model') || undefined;
  const backend = url.searchParams.get('backend') || undefined;
  const type = url.searchParams.get('type') || undefined;

  // Filter feedback by the related log's model/backend when requested.
  const where = {};
  if (type && FEEDBACK_TYPES.includes(type)) where.feedback_type = type;
  if (modelId || backend) {
    where.playground_log = {};
    if (modelId) where.playground_log.model_id = modelId;
    if (backend) where.playground_log.backend = backend;
  }

  const rows = await safeQuery(
    () =>
      prisma.feedback.findMany({
        where,
        include: { playground_log: true },
        orderBy: { created_at: 'desc' },
        take: 200
      }),
    [],
    'list feedback'
  );

  const counts = FEEDBACK_TYPES.reduce((acc, t) => {
    acc[t] = rows.filter((r) => r.feedback_type === t).length;
    return acc;
  }, /** @type {Record<string, number>} */ ({}));

  return json({ counts, rows });
}
