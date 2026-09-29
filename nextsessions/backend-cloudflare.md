# Backend session: move Axiom Pathways off Supabase onto Cloudflare

Paste this into a fresh Claude Code session opened in `~/axiom-pathways`.
The frontend session owns everything under `components/` and `app/**/page.tsx`
styling; this session owns data, auth, storage and hosting. Do not restyle UI.

## Why

Matthew wants one platform he and Claude can both drive from the CLI
(`wrangler`), and to drop Supabase. Decided 2026-09-27.

## What exists today (measured, not guessed)

- Next.js 15 App Router on Vercel. Supabase is used from 40 files via
  `lib/supabase/{client,server,admin}.ts` (`getBrowserSupabase`,
  `getServerSupabase`, `getAdminSupabase`).
- 17 tables. By call count: profiles 13, articles 10, applications 9,
  email_queue 8, saved_internships 7, sources 5, chapter_applications 5,
  learn_modules 4, internships 4, avatars (storage) 3, startup_inquiries 2,
  email_optouts 2, videos, resources, intern_directory, email_log,
  career_applications. Schema + triggers + RLS live in `supabase/migrations/`.
- Auth: Google OAuth (primary, `components/onboarding/GoogleButton.tsx`),
  GitHub linked as a second identity inside the application
  (`components/onboarding/flow/GitHubConnect.tsx`, `linkIdentity`), legacy
  email+password (`components/auth/AuthForm.tsx`), `/auth/callback` route,
  15 `auth.getUser()` call sites, role in `profiles.role`.
- The applicant Sheet (Apps Script webhook, `lib/apply-contract.ts`) is
  authoritative and is NOT part of this move. Its wire contract is frozen.

## Target

| Concern | Now | Cloudflare |
|---|---|---|
| Hosting | Vercel | Workers via `@opennextjs/cloudflare` |
| Database | Supabase Postgres | **D1** (SQLite). Decided 2026-09-29: one platform, driven by `wrangler`. Neon was the fallback and isn't needed; see the port table in `docs/SESSION-BACKEND.md` |
| Auth | Supabase Auth | **Better Auth** on the same DB: Google + GitHub providers, account linking on, sessions in cookies |
| Files | Supabase Storage (`avatars`) | **R2** bucket, signed URLs |
| HQ, the live applicant dashboard | `/hq/[code]`: `requireAdmin()` + a secret code, both 404 on failure (built 2026-09-29) | **Cloudflare Access** in front of `/hq/*` and `/admin/*`, allowlisting Matthew's and Frank's Google emails, with the app's two checks kept behind it. A hidden URL is not protection: this is minors' contact data |

**Composio is not an auth provider.** It connects AI agents to third-party apps
on a user's behalf. It does not log people into this site. Use Better Auth.

## Where it stands (2026-09-29)

- **Step 1 is done**: `docs/SESSION-BACKEND.md` has every trigger, function
  and policy, with how each one is enforced on D1.
- **HQ already uses the seam** step 2 asks for: `lib/data/hq/` (types, pure
  normalise/aggregate with tests, a Supabase adapter) behind `getHqSource()`.
  The D1 adapter implements `HqSource` and gets swapped in there.
- `supabase/migrations/0020_hq.sql` (read/decided columns, startup status,
  `hq_audit`) is written but **not applied**. It goes on Supabase first, and
  into the D1 schema after.
- The Supabase CLI is logged in to the wrong account for Axiom (project
  `robmrvpacjqxvxrivrrz` isn't in its list). Wrangler isn't installed.
- GitHub sign-in waits for Better Auth. The Supabase GitHub provider stays off.

## Steps (commit after each, author Matthew Park <matthew.parkk0@gmail.com>, never push)

1. Read `supabase/migrations/*` fully. List every trigger, function and RLS
   policy and how each will be enforced after the move (SQLite has no RLS:
   every policy becomes an explicit check in a server-side data function).
   Write that table to `docs/SESSION-BACKEND.md` before writing any code.
2. Introduce a `lib/data/` layer with one function per query the app actually
   makes, still backed by Supabase. Move all 40 call sites onto it. The app must
   behave identically at the end of this step — this is the step that makes
   the swap safe.
3. Create the D1 database + schema migrations (`wrangler d1 migrations`), R2
   bucket, and `wrangler.jsonc`. Ship `.env.example` / `.dev.vars.example`
   only; Matthew pastes real secrets. Never read `.env*`.
4. Better Auth: Google + GitHub, account linking, a `role` field. Port
   `/auth/callback` behaviour (return to `next`, backfill intern role from an
   existing application). Keep `GoogleButton` / `GitHubConnect` props stable so
   the frontend does not change.
5. Swap `lib/data/` from Supabase to D1/R2 behind the same signatures.
6. Data migration script: export Supabase → import D1, dry-run first, row
   counts compared table by table. Matthew runs the real one.
7. OpenNext build + `wrangler dev` locally; verify sign-in, apply, dashboard
   routes. Staging deploy only when Matthew says so. Never put localhost in
   any OAuth redirect config.

## Ask Matthew before

Creating any Cloudflare resource, running a migration against real data,
deploying, touching DNS for axiomapply.com, or deleting anything in Supabase.
Supabase stays live and untouched until the Cloudflare version is verified.
