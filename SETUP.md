# Axiom Pathways — Setup (Matthew's checklist)

The code never contains secrets. Everything below is done by **you**, and
values are pasted by **you** into `.env.local` (local) and Vercel → Project →
Settings → Environment Variables (deploys).

## Environment variables

| Variable | Where it comes from | Needed from |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API | Stage 3 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API | Stage 3 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API (keep secret!) | Stage 3 |
| `CRON_SECRET` | any long random string (`openssl rand -hex 32`) | Stage 4 |
| `ADMIN_EMAILS` | comma-separated admin emails (yours) | Stage 4 |
| `NEXT_PUBLIC_APPS_SCRIPT_WEBHOOK` | optional — defaults to the current webhook baked into the code | optional |

`.env.local` template (fill in and save at repo root — it's gitignored):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
CRON_SECRET=
ADMIN_EMAILS=andysampark@gmail.com
```

## Stage 3 — Supabase project (once)

1. supabase.com → New project (name: `axiom-pathways`, region: US West).
2. Project Settings → API → copy the three keys into `.env.local` + Vercel.
3. SQL Editor → run each file in `supabase/migrations/` in order.
4. Authentication → Providers → Google:
   - Google Cloud Console → create OAuth client (Web application).
   - Authorized redirect URI: the callback URL Supabase shows on that page.
   - Paste client ID + secret into Supabase.
5. Authentication → URL Configuration:
   - Site URL: `https://www.axiompathways.org`
   - Additional redirect URLs:
     - `http://localhost:3000/**`
     - `https://axiompathways.org/**`
     - `https://*.vercel.app/**`
6. After first sign-in: Table Editor → `profiles` → your row → set `is_admin = true`.

## Stage 4 — Cron

Vercel picks up `vercel.json` automatically. Just make sure `CRON_SECRET` is
set in Vercel env vars. Manual refresh: `/admin/sources` → "Run now".

## Local dev

```
npm install
npm run dev   # http://localhost:3000
```
