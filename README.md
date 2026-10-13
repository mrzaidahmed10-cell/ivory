# Ivory

Gym progress tracker. Static app plus a Cloudflare Pages worker (`_worker.js`) for accounts, sync and the Groq-powered coach.

- `src/` – source (edit here), `build.py` – bundles it into `dist/`
- `dist/` – deployable output (Cloudflare Pages build output directory, no build command needed)

Cloudflare Pages settings: framework none, build command empty, output directory `dist`.
Bindings: KV namespace `IVORY_KV`; secret `GROQ_API_KEY`; optional vars `GROQ_MODEL`, `MAX_USERS` (default 10).
