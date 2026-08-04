# Deploy — Vercel, Supabase, Resend, Apps Script

Everything in this file is done by **Matthew**. No secret is ever read or
written by the codebase or by Claude — values go into `.env.local` (local) and
the Vercel dashboard (deploys), both of which stay out of git.

Order matters: **Supabase → env vars → Apps Script → Resend → deploy.** Each
stage below can be verified before moving on.

---

## 1. Supabase

### 1a. Migrations

Run every file in `supabase/migrations/` in order, in the SQL editor. `0001`
through `0013` are already applied. Still to run:

| File | What it adds |
|---|---|
| `0014_email.sql` | `email_optouts`, `email_log` — **apply before any email test**, or every send fails its logging step |
| `0015_profile.sql` | `profiles.phone`, `profiles.avatar_url`, the `avatars` storage bucket + its RLS, and `intern_directory` re-created with the photo |

`supabase/ALL_MIGRATIONS.sql` is a stale one-shot bundle (0001–0010 only) —
ignore it and use the numbered files.

After `0015`, confirm in the dashboard: **Storage → Buckets → `avatars`**
exists and is marked public.

### 1b. Auth → URL Configuration

- **Site URL:** `https://axiomapply.com`
  Never localhost — a localhost Site URL sends every production magic link to
  a machine the recipient does not have.
- **Redirect URLs:**
  - `https://axiomapply.com/auth/callback`
  - the Vercel preview domain + `/auth/callback`
  - `http://localhost:3005/auth/callback` (local dev only; the dev server runs
    on 3005, not 3000)

### 1c. Google provider

Authentication → Providers → Google → enable, and paste the client ID and
secret from a Google Cloud OAuth client (type: Web application). The authorized
redirect URI is the one Supabase prints on that page.

---

## 2. Environment variables

Vercel → Project → Settings → Environment Variables. Set each for
**Production** and **Preview**. Names must match `.env.example` exactly.

| Key | Notes |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public |
| `SUPABASE_SERVICE_ROLE_KEY` | **server-only** — bypasses RLS. Without it the Supabase half of the application dual write silently no-ops |
| `RESEND_API_KEY` | server-only |
| `RESEND_FROM_TX` | `Matthew Park <matthew@tx.axiomapply.com>` |
| `RESEND_FROM_NEWS` | `Axiom Pathways <hello@news.axiomapply.com>` |
| `RESEND_REPLY_TO` | a mailbox you actually read |
| `EMAIL_UNSUB_MAILBOX` | an address that exists — see the domain note below |
| `EMAIL_POSTAL_ADDRESS` | virtual mailbox or PO box. **Never a home address** — it appears in the footer of every marketing email |
| `EMAIL_UNSUB_SECRET` | `openssl rand -hex 32` |
| `NEXT_PUBLIC_SITE_URL` | `https://axiomapply.com` |
| `ADMIN_EMAILS` | comma-separated allowlist for `/admin` |
| `CRON_SECRET` | `openssl rand -hex 32` — protects the daily feed refresh |
| `NEXT_PUBLIC_APPS_SCRIPT_WEBHOOK` | optional; falls back to the URL baked into `apply-contract.ts` |
| `STARTUP_APPS_SCRIPT_WEBHOOK` | **new** — the startup Sheet webhook from stage 3 |

Domain note: `axiomapply.com` is the live domain. `axiompathways.org` is parked
at a registrar and delivers no mail, so any `@axiompathways.org` address used
as a reply-to or unsubscribe mailbox bounces. Point those at `axiomapply.com`.

---

## 3. Apps Script — the two Sheets

Two completely separate scripts, deployments, and spreadsheets. Neither one
can write to the other's Sheet.

| Applicant | Script | Sheet | How it posts |
|---|---|---|---|
| Interns | `APPS_SCRIPT_WEBHOOK.gs` | Intern tracker | Browser `no-cors` POST — **frozen, do not touch** |
| Startups | `APPS_SCRIPT_STARTUPS.gs` | Startups sheet (`1qFIBAS…FjuZI`) | Server-side POST from the submit action |

To deploy the startup one (the intern one is already live):

1. Open the startups Sheet → Extensions → Apps Script.
2. Paste all of `APPS_SCRIPT_STARTUPS.gs`, replacing the stub. Save.
3. Deploy → New deployment → **Web app**, Execute as **Me**, access
   **Anyone**. Deploy, then Authorize/Allow.
4. Open the resulting `/exec` URL in a browser. It must print
   `{"ok":true,"service":"axiom-startups-webhook"}`.
5. Set that URL as `STARTUP_APPS_SCRIPT_WEBHOOK` in `.env.local` and Vercel.

The script creates the `Startups` tab and its header row on the first
submission. Until the env var is set, startup applications land in Supabase
only — no error, no lost data.

---

## 4. Resend

1. Verify **two** subdomains, not the root: `tx.axiomapply.com` (transactional)
   and `news.axiomapply.com` (marketing). Splitting them keeps a campaign
   complaint from taking magic links down with it.
2. Add the SPF and DKIM records Resend prints, per subdomain.
3. Add DMARC once, at `_dmarc.axiomapply.com`:
   ```
   v=DMARC1; p=none; rua=mailto:dmarc@axiomapply.com; fo=1; adkim=r; aspf=r
   ```
   Ramp it only after a week of clean reports:
   `p=none` → `quarantine; pct=25` → `pct=100` → `reject`.
4. Turn click and open tracking **off** for the transactional domain. Tracking
   rewrites URLs, and a scanner that follows a rewritten magic link burns the
   single-use token before the human clicks it.
5. Point the `email.bounced` and `email.complained` webhooks at the app so hard
   bounces land in `email_optouts`.

---

## 5. Before the first deploy

- [x] `npm run build` passes locally (verified 2026-08-03, 28 routes, no env).
- [x] Framework preset. The project was still set to Astro from the old site,
      so the first Next deploy built fine and then failed with `No Output
      Directory named "dist"` — Astro emits `dist`, Next emits `.next`.
      `vercel.json` now pins `framework`, `buildCommand`, and
      `outputDirectory`, which override the dashboard. Flip the dashboard
      preset to Next.js as well so the two agree.
- [ ] Replace the placeholder imagery in `/public/media/` — none of it is ours
      to publish. Fine while building, not fine live.
- [ ] Compress `feature-video.mp4` (5.5MB).
- [ ] `12,597` is hardcoded copy in two places — update it or read it from the
      internships table.
- [ ] Decide what to do with the ~12 remaining `axiompathways.org` references,
      including 5 `hello@axiompathways.org` mailtos that currently go nowhere.

---

## 6. Verifying it actually works

In this order, after stages 1–3:

1. Submit a real application at `/apply`.
2. Supabase → Table editor → `applications` — the row is there.
3. The intern Google Sheet — the same row is there.
4. Supabase → `email_log` — an `applicationReceived` row.
5. Submit a startup application at `/for-startups`.
6. `startup_inquiries` in Supabase **and** the `Startups` tab in the new Sheet.

If step 2 is empty but step 3 is fine, `SUPABASE_SERVICE_ROLE_KEY` is missing —
`getAdminSupabase()` returns null and the Supabase write no-ops by design.
