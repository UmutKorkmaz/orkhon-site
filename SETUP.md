# Setup — orkhon.umutkorkmaz.net

The site (landing + Lab UI + auth wiring + `/api/chat` backend proxy) is **deployed and live**.
Two things only an operator can provide — until they're set, the site loads fully but **Google login**
and **live chat** are inert (chat shows a friendly "backend not connected" message).

Server env lives at `/var/www/orkhon/.env` (systemd `orkhon` service, port 3001, behind nginx).

## 1. Google login (Auth.js v5)

1. Google Cloud Console → APIs & Services → Credentials → **Create OAuth client ID** (Web application).
2. Authorized redirect URI: `https://orkhon.umutkorkmaz.net/api/auth/callback/google`
3. Add to `/var/www/orkhon/.env`:
   ```
   GOOGLE_CLIENT_ID=<your-client-id>.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=<your-client-secret>
   ```
   (`AUTH_SECRET` is already generated on the server. `NEXTAUTH_URL=https://orkhon.umutkorkmaz.net` is set.)
4. `systemctl restart orkhon`

After this the **Sign in with Google** button on `/lab` works; signed-in users get the "Unlimited" tier.

## 2. Live chat backend (Hugging Face Space)

The Lab calls `/api/chat`, which proxies to the Orkhon HF Space (`ORKHON_SPACE`, default `korkmazumut/orkhon-demo`) via `@gradio/client`.

1. On Hugging Face: make the Space **public** (it's currently private → 401) and give it enough hardware to load a model (CPU basic works for the small checkpoints; CPU-upgrade/GPU for the bigger ones).
2. The Space's `app.py` loads **one** model via env. To serve all 7 models from one Space, upgrade it to a model-selector variant (see `spaces/orkhon-demo/app.py` in the `UmutKorkmaz/orkhon` repo) and push the model weights to the Space/HF.
3. (Optional) If the Space is private, set `ORKHON_HF_TOKEN` (a read token) in `/var/www/orkhon/.env`.
4. `systemctl restart orkhon`

Until this is done, `/lab` renders fully but messages return HTTP 503 `{"error":"backend_unavailable"}` → the UI shows "The live model backend is not connected yet."

## Deploy (for reference)

```
# ship source (NOT node_modules/.next/.env — those are built on the server)
rsync -az --exclude '.git' --exclude 'node_modules' --exclude '.next' --exclude '.env' \
  --exclude 'dev.db' --exclude '*.log' --exclude '.DS_Store' \
  ./ root@159.223.24.110:/var/www/orkhon/
# server (build ON the server — Prisma 7 + better-sqlite3 is a native module, so a macOS
# build won't run on Linux; building on the server produces the correct native binding)
ssh root@159.223.24.110 'cd /var/www/orkhon && pnpm install && pnpm prisma generate && \
  pnpm prisma migrate deploy && pnpm build && systemctl restart orkhon'
```

The service runs `next start -p 3001` (full node_modules, not standalone — standalone can't
trace the `better-sqlite3` native `.node`). `DATABASE_URL=file:/var/www/orkhon/prisma/dev.db`.
nginx proxies `orkhon.umutkorkmaz.net` → `127.0.0.1:3001`.

**Gotchas**: there's a stray `pnpm-workspace.yaml` left by create-next-app — delete it (it makes
`pnpm install` fail with "packages field missing"). And `next start` warns under `output: "standalone"`,
so that was removed from `next.config.ts`.
