# Evaluation API

Submit and read model evaluation results that power the **Leaderboard** and
**Capability Radar** on the `/evaluation` page.

Data is stored in a self-contained file store (`eval-store.json`, seeded with demo
models) — it does **not** require the database and is independent from `/api/chat`.

> Base URL: your site origin (e.g. `http://localhost:5173` in dev).

---

## Model object

```jsonc
{
  "id": "Qwen-Thai-SFT",          // model_id (URL-safe, used in the path)
  "name": "Qwen-Thai-SFT",        // display name
  "ours": true,                   // optional: highlight as "our" model
  "base": false,                  // optional: baseline used for Δ comparison
  "scores": { "exam": 71, "math": 58, "inst": 74, "chat": 68,
              "trans": 82, "nlu": 79, "legal": 55, "safe": 91 },
  "overall": 72,                  // computed: average of present axis scores
  "updated_at": "2026-06-07T..."
}
```

### Capability axes (task keys)

| key     | name         |
|---------|--------------|
| `exam`  | Exam (MCQ)   |
| `math`  | Math         |
| `inst`  | Instruct     |
| `chat`  | Chat/Gen     |
| `trans` | Translate    |
| `nlu`   | NLU          |
| `legal` | Legal RAG    |
| `safe`  | Safety       |

All scores are normalized **0–100**.

---

## Endpoints

### `GET /eval`
Returns the full dataset for the dashboard.

```json
{
  "axes": [{ "key": "exam", "name": "Exam (MCQ)" }, "..."],
  "models": [{ "id": "...", "name": "...", "scores": { "...": 0 }, "overall": 0 }]
}
```

### `GET /eval/{model_id}`
Returns one model (with `overall`). `404` if not found.

### `POST /eval/{model_id}`
Create or update a model's task scores. Existing scores are **merged** (only the
axes you send are changed). Returns `{ ok: true, model }`.

**Body — three accepted shapes:**

1. Object map (recommended)
```json
{ "name": "Qwen-Thai-SFT", "tasks": { "exam": 71, "math": 58, "safe": 91 } }
```

2. Array of results
```json
{ "name": "Qwen-Thai-SFT", "tasks": [ { "task": "exam", "score": 71 }, { "task": "math", "score": 58 } ] }
```

3. Single task
```json
{ "task": "exam", "score": 71 }
```

`tasks` may also be named `scores` or `results`. Unknown task keys are ignored;
values are clamped to 0–100.

**Responses**
- `200` — `{ "ok": true, "model": { ...with overall } }`
- `400` — invalid JSON, or no valid task scores found

---

## Examples

### curl — submit several tasks
```bash
curl -X POST http://localhost:5173/eval/Qwen-Thai-SFT \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Qwen-Thai-SFT",
    "tasks": { "exam": 71, "math": 58, "inst": 74, "chat": 68,
               "trans": 82, "nlu": 79, "legal": 55, "safe": 91 }
  }'
```

### Python
```python
import requests

requests.post(
    "http://localhost:5173/eval/Qwen-Thai-SFT",
    json={
        "name": "Qwen-Thai-SFT",
        "tasks": {"exam": 71, "math": 58, "safe": 91},
    },
)

board = requests.get("http://localhost:5173/eval").json()
print(board["models"][0])
```

### Read the leaderboard
```bash
curl http://localhost:5173/eval
curl http://localhost:5173/eval/Qwen-Thai-SFT
```

---

## Notes
- The `/evaluation` page reads this data server-side; after a `POST`, refresh the
  page to see the Leaderboard / Radar update.
- To reset to seed data, delete `eval-store.json` and restart the server.
- For a model to show as the highlighted "ours" row or the radar baseline, set
  `ours`/`base` directly in `src/lib/server/evalStore.js` (seed) — the public API
  only updates `name` and task `scores`.
