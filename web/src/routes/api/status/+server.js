/**
 * GET /api/status -> latest status check per backend + overall mode.
 */
import { json } from '@sveltejs/kit';
import { prisma, safeQuery } from '$lib/server/db.js';
import { getApiConfig } from '$lib/server/config.js';

export async function GET() {
  const cfg = await getApiConfig();

  const recent = await safeQuery(
    () => prisma.statusCheck.findMany({ orderBy: { created_at: 'desc' }, take: 30 }),
    [],
    'list statusChecks'
  );

  // Keep only the most recent check per backend.
  const latestByBackend = {};
  for (const row of recent) {
    if (!latestByBackend[row.backend]) latestByBackend[row.backend] = row;
  }

  return json({
    mode: cfg.mode,
    default_backend: cfg.default_backend,
    backends: latestByBackend,
    recent
  });
}
