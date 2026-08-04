# Next session — account rebuild, backend verification, deploy

Written 2026-08-03 at the end of a long build session. Everything below is
either **not started** or **built but unverified against live services**.

Branch: `next-rebuild`. Nothing committed, nothing pushed. Dev server runs on
`:3005` (`npm run dev`).

---

## Prompt to paste into a fresh session

> Read `docs/NEXT-SESSION.md` in `~/Downloads/current-projects/axiom-pathways`
> and continue that work. Previous session rebuilt the apply engine, the
> welcome-screen scroll sections, the onboarding side-picker, the intern
> workspace dashboard, and the email templates — all UI is done and verified in
> the browser. This session is the backend half: the account/profile rebuild
> (phone column, profile picture via Supabase Storage, prefill from a submitted
> application), verifying that a real application lands in BOTH the Supabase
> `applications` table and the Google Sheet, and the Vercel + env setup.
> Apply migrations 0014 and any new ones yourself only after showing me the SQL.
> Do not commit or push without asking.

---

## 1. Account / profile rebuild — not started

Goal: `/account` becomes a real profile the founders can read, and it fills
itself from an application the person already submitted.

### 1a. Schema (needs a migration, `supabase/migrations/0015_profile.sql`)
- `profiles.phone text`
- `profiles.avatar_url text`
- Backfill nothing; both nullable.

### 1b. Profile picture — Supabase Storage
- Create a public bucket `avatars`.
- RLS: a user may `insert`/`update`/`delete` only under a path prefixed with
  their own `auth.uid()`; anyone may `select` (founders need to see faces).
- Upload from the client with `supabase.storage.from("avatars").upload(...)`,
  then write the public URL to `profiles.avatar_url`.
- The rail (`components/intern/Sidebar.tsx`) and the dashboard greeting should
  use it where they currently render an initial.

### 1c. Prefill Account from the application
`lib/applications.ts` currently only reads `status`. Add a
`getMyApplication()` that returns the latest row, then map on `/account`:

| application field | profile field |
|---|---|
| `name` | `display_name` |
| `phone` | `phone` (new) |
| `school` | `school` |
| `grade` | `grade` |
| `interest` | `preferred_fields` (single-element array) |
| `startup_role` | `looking_for` |
| `github` / `linkedin` / `instagram` | `github` / `linkedin` / `social` |

Prefill only empty profile fields — never overwrite something the user typed.

### 1d. Question parity audit
The intern question set is **derived** from `lib/apply-contract.ts` (frozen wire
contract), so it cannot drift from the live site's field names. Still worth one
manual pass against `axiomapply.com`: label text, help text, option strings,
file accept rules. `lib/apply-sections.ts` throws at module load if a section
references a field name that is not in the contract — that guard is the safety
net.

---

## 2. Backend verification — built, never verified live

The dual write exists but has never run against real Supabase credentials.

- `lib/apply-submit.ts` — Apps Script webhook. **Frozen**: browser `fetch`,
  `mode: "no-cors"`, `URLSearchParams` body, files as
  `<name>_name` / `<name>_type` / `<name>_base64`. Do not "improve" this.
- `lib/actions/applications.ts` — `recordApplication()` inserts into
  `public.applications` with the service-role client (the form works signed-out,
  and RLS only allows an insert when `auth.uid() = user_id`).

**What to verify, in order:**
1. `.env.local` has `SUPABASE_SERVICE_ROLE_KEY` — without it `getAdminSupabase()`
   returns null and the Supabase half silently no-ops.
2. Submit a real test application at `/apply`.
3. Confirm the row in Supabase → Table editor → `applications`.
4. Confirm the same row in the Google Sheet.
5. Confirm `email_log` has an `applicationReceived` row.

Migrations **0012 + 0013 are applied**. `0014_email.sql`
(`email_optouts`, `email_log`) is written but **not applied** — apply it before
testing email, or every send fails its logging step.

---

## 3. Email — templates done, sending unverified

Templates in `lib/email/templates.ts`, all plain text, all replyable:

| function | trigger | class |
|---|---|---|
| `accountCreated` | email+password signup in the apply gate | transactional |
| `internWelcome` | profile first gets `role = intern` | marketing |
| `applicationReceived` | row inserted into `applications` | transactional |
| `accepted` / `notSelected` | status change (admin-triggered, not wired to UI) | transactional |
| `startupReceived` / `startupApproved` | startup application / approval | transactional |

Sending no-ops cleanly (`skipped: "email-not-configured"`) until keys exist.

---

## 4. Vercel + env — what Matthew has to do

### Environment variables (Vercel → Settings → Environment Variables)
Copy the names exactly from `.env.example`. Set for **Production** and
**Preview**.

| Key | Notes |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public |
| `SUPABASE_SERVICE_ROLE_KEY` | **server-only** — bypasses RLS |
| `RESEND_API_KEY` | server-only |
| `RESEND_FROM_TX` | `Matthew Park <matthew@tx.axiomapply.com>` |
| `RESEND_FROM_NEWS` | `Axiom Pathways <hello@news.axiomapply.com>` |
| `RESEND_REPLY_TO` | a mailbox you actually read |
| `EMAIL_UNSUB_MAILBOX` | `unsub@axiompathways.org` |
| `EMAIL_POSTAL_ADDRESS` | virtual mailbox / PO box — **never a home address** |
| `EMAIL_UNSUB_SECRET` | `openssl rand -hex 32` |
| `NEXT_PUBLIC_SITE_URL` | `https://axiomapply.com` |
| `ADMIN_EMAILS` | comma-separated allowlist for `/admin` |
| `CRON_SECRET` | `openssl rand -hex 32`, protects the daily feed refresh |
| `NEXT_PUBLIC_APPS_SCRIPT_WEBHOOK` | optional; falls back to the URL in `apply-contract.ts` |

### Supabase
- Auth → URL Configuration → **Site URL** = `https://axiomapply.com`
- Redirect URLs must include `https://axiomapply.com/auth/callback`
  (add the Vercel preview domain too, and `http://localhost:3005/auth/callback`
  for local work).
- Never put localhost in the production Site URL.
- Google provider enabled with its client ID/secret.

### Resend
- Verify **two** subdomains: `tx.axiomapply.com` and `news.axiomapply.com`.
- Add DMARC at `_dmarc.axiomapply.com`:
  `v=DMARC1; p=none; rua=mailto:dmarc@axiompathways.org; fo=1; adkim=r; aspf=r`
  Ramp `p=none` → `quarantine; pct=25` → `pct=100` → `reject`.
- Point `email.bounced` / `email.complained` webhooks at the app so hard
  bounces land in `email_optouts`.

### Before the first deploy
- `npm run build` locally — the dev server has been the only check so far.
- Swap the placeholder imagery in `/public/media/` for Axiom's own assets.
  None of it is ours to publish; fine while building, not fine in production.
- The 5.5MB `feature-video.mp4` needs compression.
- `12,597` is hardcoded copy in two places — either update it or read it from
  the internships table.

---

## 5. Deliberately deferred

- **DM feature** between interns — own tables, own RLS, own session.
- Real photography/video in the apply media panel and the pinned slides.
- The intern-list screenshot + scroll video for the startup media panel.
