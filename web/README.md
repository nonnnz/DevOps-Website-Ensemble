# Thai LLM Portal

A full-stack **SvelteKit (JavaScript)** portal and demo platform for a Thai-first
large language model built from scratch. It is more than a landing page — it ships
a working **chat playground**, **evaluation dashboard**, **admin config**, and an
**OpenAI-compatible API adapter** that is ready to connect to real **B200 / LANTA**
inference compute.

- 🇹🇭 Thai + English friendly UI, minimal AI-lab aesthetic (primary `#247FFF`)
- 💬 Streaming chat playground with runtime metrics + feedback → PostgreSQL
- 🧪 Mock mode works with **zero external services**; real mode is OpenAI-compatible
- 🛠 Admin config for ML DevOps (backends, models, feature flags, status checks)
- 🤖 WebGL-ready 3D mascot (Threlte) with a polished CSS/SVG fallback
- 🗄 PostgreSQL via Prisma — models, logs, feedback, evaluations, config, status

> **JavaScript only.** No TypeScript / `.ts` files. JSDoc is used for hints.

---

## Tech stack

| Layer     | Choice |
|-----------|--------|
| Framework | SvelteKit 2 + Svelte 4 (`adapter-node`) |
| Language  | JavaScript (`.js` / `.svelte`) |
| Styling   | Tailwind CSS 3 (design tokens) |
| Database  | PostgreSQL + Prisma ORM |
| 3D        | Three.js + Threlte (`@threlte/core`, `@threlte/extras`) |
| Infra     | Docker Compose (PostgreSQL) |

---

## Quick start (TL;DR)

```bash
npm install
cp .env.example .env          # Windows: copy .env.example .env
npm run db:up                 # start PostgreSQL (Docker)
npm run setup                 # prisma generate + migrate + seed
npm run dev                   # http://localhost:5173
```

The site runs in **mock mode** out of the box — no inference API required.

---

## Setup (step by step)

### 1. Install dependencies
```bash
npm install
```

### 2. Start PostgreSQL with Docker Compose
```bash
npm run db:up        # docker compose up -d
# stop later with: npm run db:down
```
This starts Postgres 16 on `localhost:5432` with user/pass/db = `thaillm`.

### 3. Configure `.env`
```bash
cp .env.example .env     # Windows: copy .env.example .env
```
The defaults match Docker Compose. Key variables:
```env
DATABASE_URL=postgresql://thaillm:thaillm@localhost:5432/thaillm?schema=public
LLM_API_MODE=mock
```

### 4. Run migrations
```bash
npm run prisma:migrate    # creates tables (prisma migrate dev)
```
> Generate the client only: `npm run prisma:generate`

### 5. Seed the database
```bash
npm run db:seed
```
Seeds models, default API config, feature flags, evaluation results, and sample
playground logs + feedback.

### 6. Start the dev server
```bash
npm run dev
```
Open http://localhost:5173.

### 7. Switch between mock mode and real API mode

Two ways — env or the Admin UI:

- **Env:** set `LLM_API_MODE=real` in `.env` and provide `LLM_API_BASE_URL` + `LLM_API_KEY`.
- **Admin UI:** go to `/admin/config` → *A. API Backend Config* → set **API mode** to `real`.

In **mock** mode the `/api/chat` endpoint returns realistic Thai demo responses with
simulated streaming + metrics, and never calls an external service.

### 8. Connect a B200 / LANTA endpoint

Point the OpenAI-compatible adapter at your serving engine (vLLM / TGI / Triton):

```env
LLM_API_MODE=real
LLM_API_BASE_URL=http://your-b200-host:8000   # adapter calls ${BASE}/v1/chat/completions
LLM_API_KEY=your-secret-key
# Optional per-backend overrides:
B200_ENDPOINT_URL=http://b200-host:8000
LANTA_ENDPOINT_URL=http://lanta-host:8000
```

Or set the endpoints in `/admin/config` and use the **Status Check** panel
(*Test B200 / LANTA / Chat Completion*) to verify connectivity.

> 🔌 **Where ML DevOps connects the real backend:** `src/lib/server/llmClient.js`
> (`realStream`) and `src/lib/server/config.js` (`resolveBackend`).

### 9. The 3D mascot

The home hero uses a **Spline 3D mascot** by default (`mode="spline"`), loaded
client-side from a `.splinecode` URL. `MascotStage` supports four modes:

| mode | source | notes |
|------|--------|-------|
| `spline` (default) | `splineUrl` | Spline `<spline-viewer>` scene — current mascot |
| `webgl` | `static/models/mascot.glb` | Threlte / Three.js `.glb` |
| `image` | `src` | static image |
| `placeholder` | — | CSS/SVG fallback (always works) |

- **Swap the Spline scene:** edit `site.mascot.splineUrl` in
  `src/lib/data/[site.js](src/lib/data/site.js)` (Spline → Export → Viewer → copy the `.splinecode` URL).
  The original export is kept at `spline-robot-head.html` for reference.
- **Turn the 3D mascot off:** disable **WebGL mascot** in `/admin/config`
  (*C. Feature Flags*) → the home page shows the SVG placeholder.
- **Use a `.glb` instead:** drop it at `static/models/mascot.glb`, set `mode="webgl"`
  on `<MascotStage>` in `src/routes/+page.svelte`, and tune camera/lighting in
  `src/lib/components/MascotWebGL.svelte`.

If the Spline viewer or scene fails to load (offline, blocked CDN, bad URL), the
stage **automatically falls back to the SVG placeholder** — the site always looks good.

---

## Project structure

```
src/
├── lib/
│   ├── components/      # Navbar, MascotStage, PlaygroundChat, ConfigForm, ...
│   ├── data/           # static content (nav, gallery, research, fallbacks)
│   ├── server/         # db.js, config.js, llmClient.js, metrics.js, validate.js
│   └── utils/          # format.js, csv.js, chatStream.js
├── routes/
│   ├── +layout.svelte / +layout.server.js
│   ├── +page.svelte                 # Home
│   ├── model/ playground/ evaluation/ research/ docs/
│   ├── gallery/ feedback/ sponsors/ community/
│   ├── admin/config/                # ML DevOps admin
│   └── api/
│       ├── chat/        # POST  (NDJSON streaming)
│       ├── models/      # GET, POST
│       ├── status/      # GET
│       ├── status/test/ # POST
│       ├── feedback/    # GET, POST
│       └── config/      # GET, POST
prisma/schema.prisma     # 7 tables
prisma/seed.js           # seed data
docker-compose.yml       # PostgreSQL
```

---

## API routes

| Method | Route               | Purpose |
|--------|---------------------|---------|
| POST   | `/api/chat`         | Chat completion, **NDJSON streaming**, logs to DB |
| GET    | `/api/models`       | List models (`?all=1` includes hidden/disabled) |
| POST   | `/api/models`       | Create / update a model |
| GET    | `/api/status`       | Latest status check per backend |
| POST   | `/api/status/test`  | Test `b200` / `lanta` / `chat` connectivity |
| GET    | `/api/feedback`     | Feedback counts + rows (filters) |
| POST   | `/api/feedback`     | Save feedback for a playground log |
| GET    | `/api/config`       | Get API config (sanitized) + feature flags |
| POST   | `/api/config`       | Update API config and/or feature flags |

**`/api/chat` stream events (one JSON per line):**
`meta` → `delta`… → optional `error` → `done` (with `request_id`, `playground_log_id`,
`backend`, `latency_ms`, `input_tokens`, `output_tokens`, `tokens_per_second`, `status`).

---

## Environment variables

| Variable             | Default       | Description |
|----------------------|---------------|-------------|
| `DATABASE_URL`       | (compose)     | PostgreSQL connection string |
| `LLM_API_MODE`       | `mock`        | `mock` or `real` |
| `LLM_API_BASE_URL`   | —             | OpenAI-compatible base URL (real mode) |
| `LLM_API_KEY`        | —             | Secret key — **server only, never stored in DB** |
| `DEFAULT_MODEL_ID`   | `thai-llm-chat-v0.1` | Default model |
| `DEFAULT_BACKEND`    | `auto`        | `auto` / `b200` / `lanta` |
| `B200_ENDPOINT_URL`  | —             | Optional B200 endpoint override |
| `LANTA_ENDPOINT_URL` | —             | Optional LANTA endpoint override |

---

## Database schema (7 tables)

`models`, `api_configs`, `feature_flags`, `playground_logs`, `feedback`,
`evaluation_results`, `status_checks`. See `prisma/schema.prisma`.

---

## Security notes

- **Secrets never touch the DB.** The real `LLM_API_KEY` is read only from env on the
  server. The admin UI shows / stores a **masked placeholder** only.
- **All input is validated server-side** (`src/lib/server/validate.js`) and clamped
  before hitting the DB or backend. Prisma uses parameterized queries.
- **`/admin/*` has no auth yet** — add a guard in `src/hooks.server.js` before
  deploying (the page warns about this).
- The site **degrades gracefully**: if Postgres is down, pages still render with
  fallbacks and the playground still works in mock mode.

---

## NPM scripts

| Script | Action |
|--------|--------|
| `npm run dev` | Start dev server |
| `npm run build` / `npm start` | Build / run production (adapter-node) |
| `npm run db:up` / `db:down` | Start / stop PostgreSQL (Docker) |
| `npm run prisma:migrate` | Run migrations |
| `npm run db:seed` | Seed demo data |
| `npm run setup` | generate + migrate + seed |
| `npm run db:reset` | Reset DB + reseed |
| `npm run prisma:studio` | Open Prisma Studio |

---

## License

MIT — built for a Thai LLM hackathon. Wire it to your B200 / LANTA backend and ship. 🚀
