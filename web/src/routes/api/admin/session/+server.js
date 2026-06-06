/**
 * Admin session endpoints.
 *
 *   GET    /api/admin/session  -> { authed, required }   (probe; never leaks the token)
 *   POST   /api/admin/session  body { token }  -> set httpOnly admin cookie
 *   DELETE /api/admin/session  -> clear the cookie (logout)
 *
 * Auth is via ADMIN_TOKEN (env). The login compares constant-time and, on
 * success, stores the token in an httpOnly+sameSite=strict cookie so the admin
 * page's same-origin fetches are authorised automatically.
 */
import { json, error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import {
  requireAdmin,
  setAdminCookie,
  clearAdminCookie,
  timingSafeEqualStr
} from '$lib/server/security.js';
import { asString } from '$lib/server/validate.js';

export async function GET(event) {
  return json({
    authed: requireAdmin(event),
    required: Boolean(env.ADMIN_TOKEN)
  });
}

export async function POST(event) {
  const token = env.ADMIN_TOKEN || '';
  if (!token) {
    // No token configured: nothing to log into. (Dev is open; prod is closed.)
    throw error(503, 'Admin auth is not configured on this server (ADMIN_TOKEN unset).');
  }

  let body;
  try {
    body = await event.request.json();
  } catch {
    throw error(400, 'Invalid JSON body');
  }

  const supplied = asString(body.token, 512);
  if (!supplied || !timingSafeEqualStr(supplied, token)) {
    // Generic message — do not reveal whether the token format was close.
    throw error(401, 'Invalid admin token.');
  }

  setAdminCookie(event.cookies, token);
  return json({ authed: true });
}

export async function DELETE(event) {
  clearAdminCookie(event.cookies);
  return json({ authed: false });
}
