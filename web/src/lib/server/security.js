/**
 * Central security primitives for the Thai LLM portal.
 *
 * Provides:
 *   - Security response headers (defence-in-depth; CSP lives in svelte.config.js)
 *   - Admin authentication (constant-time token compare; header or cookie)
 *   - In-memory sliding-window rate limiting (per client IP)
 *   - SSRF guard for outbound inference-endpoint fetches
 *
 * Threat model addressed:
 *   1. Unauthenticated config/model writes  -> admin gate (requireAdmin)
 *   2. API-key exfiltration / SSRF via an attacker-controlled endpoint URL
 *      -> assertSafeEndpoint() blocks private/loopback/metadata targets
 *   3. Cost-based DoS on the LLM proxy       -> rate limiting
 *   4. Clickjacking / MIME sniffing / leaks  -> security headers
 */
import crypto from 'node:crypto';
import { env } from '$env/dynamic/private';

const isProd = (env.NODE_ENV || process.env.NODE_ENV) === 'production';

// ---------------------------------------------------------------------------
// Constant-time string comparison (avoids token timing side-channels).
// Hash both sides first so length is never leaked and buffers always match.
// ---------------------------------------------------------------------------
/** @param {string} a @param {string} b */
export function timingSafeEqualStr(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

// ---------------------------------------------------------------------------
// Security headers (applied to every response in hooks.server.js).
// CSP is configured separately in svelte.config.js so SvelteKit can hash its
// own inline scripts.
// ---------------------------------------------------------------------------
export function securityHeaders() {
  /** @type {Record<string,string>} */
  const h = {
    // Clickjacking
    'X-Frame-Options': 'DENY',
    // MIME sniffing
    'X-Content-Type-Options': 'nosniff',
    // Referrer leakage
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    // Disable powerful APIs we never use
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
    // Cross-origin isolation hardening
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',
    // Legacy XSS auditor off (CSP supersedes it); keep explicit
    'X-XSS-Protection': '0',
    // Don't leak the framework
    'X-Powered-By': '',
    // CSP — only the render-safe directives that never break inline scripts/
    // styles, Vite HMR, or the Spline mascot. These still close real holes:
    //   frame-ancestors  -> clickjacking (CSP-level, modern browsers)
    //   base-uri         -> <base> tag injection / relative-URL hijacking
    //   object-src none  -> Flash/plugin/embed vectors
    //   form-action self -> form-based exfiltration to external origins
    // To additionally lock down script-src/style-src, configure kit.csp in
    // svelte.config.js after a browser smoke-test (see SECURITY.md).
    'Content-Security-Policy': [
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "object-src 'none'",
      "form-action 'self'"
    ].join('; ')
  };
  // HSTS only in production (would break local http dev otherwise).
  if (isProd) h['Strict-Transport-Security'] = 'max-age=63072000; includeSubDomains; preload';
  return h;
}

// ---------------------------------------------------------------------------
// Admin authentication.
//
// Token source: ADMIN_TOKEN env var.
//   - configured  -> caller must present it via "x-admin-token" header
//                    OR the "admin_session" cookie (set by /api/admin/login)
//   - unset + dev  -> allowed (with a one-time warning) so the hackathon flow
//                     is not blocked
//   - unset + prod -> denied (fail closed)
// ---------------------------------------------------------------------------
let warnedNoToken = false;

/**
 * @param {import('@sveltejs/kit').RequestEvent} event
 * @returns {boolean}
 */
export function requireAdmin(event) {
  const token = env.ADMIN_TOKEN || '';

  if (!token) {
    if (!isProd) {
      if (!warnedNoToken) {
        console.warn('[security] ADMIN_TOKEN is not set — admin routes are UNPROTECTED in dev. Set ADMIN_TOKEN before deploying.');
        warnedNoToken = true;
      }
      return true; // dev convenience
    }
    return false; // prod: fail closed
  }

  const header = event.request.headers.get('x-admin-token') || '';
  if (header && timingSafeEqualStr(header, token)) return true;

  const cookie = event.cookies.get('admin_session') || '';
  if (cookie && timingSafeEqualStr(cookie, token)) return true;

  return false;
}

/**
 * Set the admin session cookie (httpOnly, sameSite=strict, secure in prod).
 * @param {import('@sveltejs/kit').Cookies} cookies
 * @param {string} token
 */
export function setAdminCookie(cookies, token) {
  cookies.set('admin_session', token, {
    path: '/',
    httpOnly: true,
    sameSite: 'strict',
    secure: isProd,
    maxAge: 60 * 60 * 8 // 8 hours
  });
}

/** @param {import('@sveltejs/kit').Cookies} cookies */
export function clearAdminCookie(cookies) {
  cookies.delete('admin_session', { path: '/' });
}

// ---------------------------------------------------------------------------
// In-memory sliding-window rate limiter.
// Single-node only (adapter-node). For multi-node, swap the Map for Redis.
// ---------------------------------------------------------------------------
/** @type {Map<string, number[]>} */
const hits = new Map();
let lastSweep = Date.now();

/**
 * @param {string} key                unique caller key (e.g. ip + bucket)
 * @param {number} limit              max requests per window
 * @param {number} [windowMs]         window length (default 60s)
 * @returns {{ allowed: boolean, remaining: number, retryAfter: number }}
 */
export function rateLimit(key, limit, windowMs = 60_000) {
  const nowMs = Date.now();
  const cutoff = nowMs - windowMs;

  // Periodic sweep so the Map doesn't grow unbounded.
  if (nowMs - lastSweep > windowMs) {
    for (const [k, arr] of hits) {
      const kept = arr.filter((t) => t > cutoff);
      if (kept.length) hits.set(k, kept);
      else hits.delete(k);
    }
    lastSweep = nowMs;
  }

  const arr = (hits.get(key) || []).filter((t) => t > cutoff);
  if (arr.length >= limit) {
    const retryAfter = Math.ceil((arr[0] + windowMs - nowMs) / 1000);
    hits.set(key, arr);
    return { allowed: false, remaining: 0, retryAfter: Math.max(retryAfter, 1) };
  }
  arr.push(nowMs);
  hits.set(key, arr);
  return { allowed: true, remaining: limit - arr.length, retryAfter: 0 };
}

// ---------------------------------------------------------------------------
// SSRF guard for outbound inference-endpoint fetches.
//
// By default blocks loopback / private / link-local / metadata targets so a
// misconfigured (or maliciously set) endpoint URL cannot be used to reach
// internal services or exfiltrate the API key.
//
// Set ALLOW_PRIVATE_ENDPOINTS=true to permit private hosts (needed for the
// "local" backend at http://localhost:8000 during development). Cloud metadata
// IPs are blocked even then.
// ---------------------------------------------------------------------------
const ALLOW_PRIVATE = (env.ALLOW_PRIVATE_ENDPOINTS || '').toLowerCase() === 'true';

// Always-blocked, regardless of ALLOW_PRIVATE (crown-jewel SSRF targets).
const ALWAYS_BLOCKED_HOSTS = new Set([
  '169.254.169.254',        // AWS/GCP/Azure IMDS
  'metadata.google.internal',
  'metadata'
]);

/** @param {string} host */
function isPrivateHost(host) {
  const h = host.toLowerCase().replace(/^\[|\]$/g, ''); // strip IPv6 brackets

  if (h === 'localhost' || h.endsWith('.localhost')) return true;
  if (h.endsWith('.local') || h.endsWith('.internal')) return true;

  // IPv6 loopback / link-local / unique-local
  if (h === '::1' || h === '::') return true;
  if (h.startsWith('fe80:') || h.startsWith('fc') || h.startsWith('fd')) return true;
  // IPv4-mapped IPv6 -> extract tail and re-check
  const mapped = h.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return isPrivateHost(mapped[1]);

  // IPv4 literal ranges
  const m = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (m) {
    const [a, b] = [Number(m[1]), Number(m[2])];
    if (a === 127) return true;                 // 127.0.0.0/8 loopback
    if (a === 10) return true;                  // 10.0.0.0/8
    if (a === 0) return true;                    // 0.0.0.0/8
    if (a === 169 && b === 254) return true;     // 169.254.0.0/16 link-local
    if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
    if (a === 192 && b === 168) return true;     // 192.168.0.0/16
    if (a === 100 && b >= 64 && b <= 127) return true; // 100.64.0.0/10 CGNAT
  }
  return false;
}

/**
 * Validate an outbound endpoint base URL. Throws on anything unsafe.
 * @param {string} rawUrl
 * @returns {string} the validated URL (unchanged)
 */
export function assertSafeEndpoint(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') {
    throw new Error('Inference endpoint is not configured.');
  }

  let u;
  try {
    u = new URL(rawUrl);
  } catch {
    throw new Error('Inference endpoint URL is malformed.');
  }

  if (u.protocol !== 'http:' && u.protocol !== 'https:') {
    throw new Error(`Blocked endpoint protocol: ${u.protocol}`);
  }
  // Credentials embedded in the URL are a red flag (and break the key model).
  if (u.username || u.password) {
    throw new Error('Inference endpoint must not embed credentials.');
  }

  const host = u.hostname;
  if (ALWAYS_BLOCKED_HOSTS.has(host.toLowerCase())) {
    throw new Error('Blocked endpoint host (cloud metadata).');
  }
  if (!ALLOW_PRIVATE && isPrivateHost(host)) {
    throw new Error(
      'Blocked private/loopback endpoint. Set ALLOW_PRIVATE_ENDPOINTS=true to allow local backends in development.'
    );
  }
  return rawUrl;
}

// ---------------------------------------------------------------------------
// Request body size cap (bytes). Rejects oversized POST bodies early.
// ---------------------------------------------------------------------------
export const MAX_REQUEST_BYTES = Number(env.MAX_REQUEST_BYTES) || 256 * 1024; // 256 KB
