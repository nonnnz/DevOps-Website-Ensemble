/**
 * Prisma client singleton.
 *
 * In dev, SvelteKit/Vite reloads modules frequently; without a singleton we would
 * open a new DB connection pool on every reload. We stash the client on globalThis.
 *
 * All callers should wrap queries in try/catch — the site is designed to render
 * (with fallbacks) even when Postgres is not running, so a hackathon demo never
 * hard-crashes just because the DB is down.
 */
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.__thaillm_prisma ??
  new PrismaClient({ log: [] });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__thaillm_prisma = prisma;
}

/**
 * Run a DB operation, returning a fallback value if the DB is unavailable.
 * @template T
 * @param {() => Promise<T>} fn
 * @param {T} fallback
 * @param {string} [label]
 * @returns {Promise<T>}
 */
export async function safeQuery(fn, fallback, label = 'query') {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}
