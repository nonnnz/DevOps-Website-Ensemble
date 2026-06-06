# Security

Security posture for the Thai LLM portal (SvelteKit). The single authoritative
boundary is `src/hooks.server.js`; supporting primitives live in
`src/lib/server/security.js`.

## What is protected

| Threat | Control | Where |
|---|---|---|
| **API-key exfiltration / SSRF** via attacker-set endpoint URL | `assertSafeEndpoint()` blocks loopback/private/link-local/CGNAT and cloud-metadata hosts before any outbound `fetch` (and before the `Authorization` header is attached) | `security.js`, wired into `llmClient.js`, `api/status/test` |
| **Unauthenticated config/model writes** | Admin gate on `/admin/*` and `POST/PUT/PATCH/DELETE` to `/api/config`, `/api/models` | `hooks.server.js` + `requireAdmin()` |
| **Cost-based DoS** on the LLM proxy | Per-IP sliding-window rate limit (writes `RATE_LIMIT_PER_MINUTE`/min, reads 4×) | `hooks.server.js` + `rateLimit()` |
| **Oversized request bodies** | `Content-Length` cap (`MAX_REQUEST_BYTES`, default 256 KB) | `hooks.server.js` |
| **Clickjacking / MIME sniffing / referrer leak / base-tag & form hijack** | Security headers + CSP (`frame-ancestors`, `base-uri`, `object-src`, `form-action`) | `securityHeaders()` |
| **Token timing side-channel** | `crypto.timingSafeEqual` over SHA-256 digests | `timingSafeEqualStr()` |
| **API key in DB / to client** | Key read only from `LLM_API_KEY` env; DB stores a masked placeholder | `config.js` (pre-existing) |

## Admin authentication

- Set `ADMIN_TOKEN` (e.g. `openssl rand -hex 32`).
- Log in at `/admin/login` → token is exchanged for an httpOnly, `SameSite=Strict`
  session cookie via `POST /api/admin/session`.
- API clients may instead send the `x-admin-token` header.
- **No `ADMIN_TOKEN` set:** admin is **open in dev** (with a console warning) and
  **locked in production** (fail-closed).

## Production checklist

- [ ] Set a strong `ADMIN_TOKEN`.
- [ ] Set `ALLOW_PRIVATE_ENDPOINTS=false` (only `true` for the local dev backend).
- [ ] Serve over HTTPS (HSTS auto-enables when `NODE_ENV=production`).
- [ ] If behind a proxy, configure adapter-node `ADDRESS_HEADER`/`XFF_DEPTH` so
      `getClientAddress()` (rate-limit key) sees the real client IP, not the proxy.
- [ ] For multi-node, replace the in-memory rate limiter with a shared store (Redis).

## Optional: stricter CSP

The shipped CSP intentionally omits `script-src`/`style-src` so it never breaks
Vite HMR, SvelteKit's inline hydration script, or the Spline mascot. To lock those
down, configure `kit.csp` in `svelte.config.js` (lets SvelteKit hash its own inline
scripts) and browser-test, allowing: `script-src 'self' https://unpkg.com`,
`style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
`font-src 'self' https://fonts.gstatic.com`, `connect-src 'self' https://prod.spline.design`.
