# Setup — orkhon.umutkorkmaz.net

The site (landing + chat UI + auth wiring + `/api/chat` backend proxy) is **deployed and live**.
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

After this the **Sign in with Google** button on `/chat` works; signed-in users get the "Unlimited" tier.

## 2. Live chat backend (Hugging Face Space)

The chat calls `/api/chat`, which proxies to the Orkhon HF Space (`ORKHON_SPACE`, default `korkmazumut/orkhon-demo`) via `@gradio/client`.

1. On Hugging Face: make the Space **public** (it's currently private → 401) and give it enough hardware to load a model (CPU basic works for the small checkpoints; CPU-upgrade/GPU for the bigger ones).
2. The Space's `app.py` loads **one** model via env. To serve all 7 models from one Space, upgrade it to a model-selector variant (see `spaces/orkhon-demo/app.py` in the `UmutKorkmaz/orkhon` repo) and push the model weights to the Space/HF.
3. (Optional) If the Space is private, set `ORKHON_HF_TOKEN` (a read token) in `/var/www/orkhon/.env`.
4. `systemctl restart orkhon`

Until this is done, `/chat` renders fully but messages return HTTP 503 `{"error":"backend_unavailable"}` → the UI shows "The live model backend is not connected yet."

## Deploy (for reference)

```
# local
pnpm build            # output: "standalone"
# ship (note: do NOT --exclude node_modules — the standalone node_modules is required)
rsync -az --delete --exclude '.git' --exclude '.next/cache' .next/standalone/ root@159.223.24.110:/var/www/orkhon/
rsync -az --delete .next/static/ root@159.223.24.110:/var/www/orkhon/.next/static/
# server
systemctl restart orkhon   # nginx proxies orkhon.umutkorkmaz.net → 127.0.0.1:3001
```

Caution: `rsync --delete` on the standalone dir will remove `/var/www/orkhon/.env` — recreate it after every deploy (or rsync the env separately).
