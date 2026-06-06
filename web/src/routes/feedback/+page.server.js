import { prisma, safeQuery } from '$lib/server/db.js';

export async function load() {
  const rows = await safeQuery(
    () =>
      prisma.feedback.findMany({
        include: { playground_log: true },
        orderBy: { created_at: 'desc' },
        take: 300
      }),
    [],
    'load feedback'
  );

  // Flatten for easy display / CSV export.
  const items = rows.map((r) => ({
    id: r.id,
    feedback_type: r.feedback_type,
    comment: r.comment || '',
    model_id: r.playground_log?.model_id || '-',
    backend: r.playground_log?.backend || '-',
    user_prompt: r.playground_log?.user_prompt || '',
    created_at: r.created_at
  }));

  return { items };
}
