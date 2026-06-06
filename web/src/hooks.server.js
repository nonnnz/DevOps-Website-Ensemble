/**
 * Server hooks — the single security boundary for every request.
 *
 * Responsibilities (in order):
 *   1. Rate limit  /api/*           (per client IP, sliding window)
 *   2. Enforce a request body size cap on writes
 *   3. Gate admin surfaces:
 *        - page:  /admin/*
 *        - APIs:  POST/PUT/PATCH/DELETE on /api/config and /api/models
 *   4. Apply security headers to the response
 *
 * The UI may add its own login affordances, but THIS file is the authoritative
 * boundary — every protected action is checked here regardless of the client.
 */
import { json, text } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import {
  securityHeaders,
  requireAdmin,
  rateLimit,
  MAX_REQUEST_BYTES
} from '$lib/server/security.js';

const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

// Write APIs that require admin auth. Reads (GET) stay public.
const ADMIN_WRITE_APIS = ['/api/config', '/api/models'];

const RATE_LIMIT_PER_MINUTE = Number(env.RATE_LIMIT_PER_MINUTE) || 60;

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
  const { request, url } = event;
  const { pathname } = url;
  const method = request.method;
  const ip = event.getClientAddress();

  // --- 1. Rate limiting (API only) --------------------------------------
  if (pathname.startsWith('/api/')) {
    // Writes are the expensive/abusable ones; readers get a looser bucket.
    const isWrite = WRITE_METHODS.has(method);
    const limit = isWrite ? RATE_LIMIT_PER_MINUTE : RATE_LIMIT_PER_MINUTE * 4;
    const bucket = isWrite ? 'w' : 'r';
    const { allowed, retryAfter } = rateLimit(`${ip}:${bucket}`, limit);
    if (!allowed) {
      return json(
        { error: 'Too many requests. Please slow down.' },
        { status: 429, headers: { 'Retry-After': String(retryAfter), ...securityHeaders() } }
      );
    }
  }

  // --- 2. Body size cap (writes with a declared length) -----------------
  if (WRITE_METHODS.has(method)) {
    const len = Number(request.headers.get('content-length') || 0);
    if (len > MAX_REQUEST_BYTES) {
      return json(
        { error: `Request body too large (max ${MAX_REQUEST_BYTES} bytes).` },
        { status: 413, headers: securityHeaders() }
      );
    }
  }

  // --- 3. Admin gate ----------------------------------------------------
  // The login page must stay public so users can authenticate.
  const isAdminPage =
    (pathname === '/admin' || pathname.startsWith('/admin/')) && pathname !== '/admin/login';
  const isAdminWriteApi =
    WRITE_METHODS.has(method) && ADMIN_WRITE_APIS.some((p) => pathname === p || pathname.startsWith(p + '/'));

  if (isAdminPage || isAdminWriteApi) {
    if (!requireAdmin(event)) {
      if (isAdminWriteApi) {
        return json(
          { error: 'Admin authentication required.' },
          { status: 401, headers: securityHeaders() }
        );
      }
      // Page navigation: return a minimal 401 instead of leaking the admin UI.
      return text('401 — Admin authentication required.', {
        status: 401,
        headers: { 'Content-Type': 'text/plain; charset=utf-8', ...securityHeaders() }
      });
    }
  }

  // --- 4. Resolve + security headers ------------------------------------
  const response = await resolve(event);
  for (const [k, v] of Object.entries(securityHeaders())) {
    if (v === '') response.headers.delete(k);
    else response.headers.set(k, v);
  }
  return response;
}
