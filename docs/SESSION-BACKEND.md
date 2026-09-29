# Backend session — Supabase → Cloudflare

Step 1 of `nextsessions/backend-cloudflare.md`: every trigger, function and
row-level policy in `supabase/migrations/`, and how each one will be enforced
once the data lives in **D1** (SQLite). SQLite has no RLS, no triggers on an
auth schema, and no `security definer`. Every rule below becomes an explicit
check in a server-side data function under `lib/data/`, which is the only
code allowed to touch the database. Written 2026-09-29, before any code.

## Decisions (Matthew, 2026-09-28/29)

| Concern | Now | After |
|---|---|---|
| Hosting | Vercel | Workers via `@opennextjs/cloudflare` (D1 is only reachable from inside a Worker, so hosting has to move with the data) |
| Database | Supabase Postgres | **D1**. Not Neon: Matthew wants one platform, driven by `wrangler` |
| Sign-in | Supabase Auth (Google, GitHub linking off) | **Better Auth** on D1: Google + GitHub, account linking on, cookie sessions, `role` field |
| Files | Supabase Storage `avatars` | **R2**, signed URLs |
| HQ access | `requireAdmin()` + secret code | The same two, plus **Cloudflare Access** on `/hq/*`, allowlisting Matthew's and Frank's Google accounts. Frank gets in then, not before |
| GitHub for applicants | Supabase `linkIdentity` (provider off) | Better Auth's GitHub provider, linked to the Google account. **Not Composio**: it's a tool-calling layer for agents, not a login. Its consent screen says "Composio" unless you register your own app, and it would keep minors' tokens at a third party |

Tooling state: the Supabase CLI (2.109.1) is installed, but it is logged in
to an account that **doesn't** own the Axiom project (`robmrvpacjqxvxrivrrz`).
Wrangler is **not installed**; `npm i -D wrangler` needs Matthew's OK.

## Triggers and functions

| Where | What it does | After the move |
|---|---|---|
| `0001` `handle_new_user()` + `on_auth_user_created` (security definer, on `auth.users`) | Creates a `profiles` row on signup, `display_name` = full name or email | Better Auth `databaseHooks.user.create.after` inserts the profile in the same request. `display_name` falls back to the email exactly as now |
| `0001` `touch_updated_at()` on `profiles`, `0003` on `articles` | `updated_at = now()` on every update | Every `lib/data` update function sets `updated_at` itself. SQLite triggers could do it too, but one place (the data layer) is easier to reason about |
| `0009`/`0011` `protect_profile_flags()` + `profiles_protect_flags` | Silently keeps `is_admin` and `approved` unchanged unless the writer is the service role | `updateOwnProfile()` takes an explicit allowlist of editable columns. `is_admin` and `approved` aren't on it. Only `setProfileFlags()` can change them, and it's callable only from an `/admin` server action behind `requireAdmin()` |
| `0011` `revoke update (is_admin, approved)` | A second lock on the same thing | Covered by the allowlist above; there are no client DB roles in D1 |

## Row-level policies

"Own" means `auth.uid()` today and the Better Auth session's user id after.

| Table | Policy today | Enforced after as |
|---|---|---|
| `profiles` | select own; update own with `is_admin`/`approved` pinned | `getProfile(session)`, `updateOwnProfile(session, allowlisted fields)` |
| `sources` | RLS on, no policies (service role only) | Only admin/cron functions read it |
| `internships` | public read | `listInternships()`, no session needed |
| `saved_internships` | all ops own | Every function takes the session and filters `user_id = session.user.id` |
| `articles`, `learn_modules`, `resources`, `videos` | public read where `published` | Public list functions add `published = 1`; admin functions don't |
| `startup_inquiries` | anon insert; reads service role only | `submitStartupApplication()` inserts; reads only in HQ/admin behind `requireAdmin()` |
| `applications` | select own (by `user_id` or verified email); insert own; UPDATE revoked | `getMyApplication(session)` matches `user_id` or the session's **verified** email; inserts only from the apply action; status updates only from HQ / the Sheet push |
| `chapter_applications` | anon insert; select own (id or email); UPDATE revoked | Same shape as `applications` |
| `career_applications` | anon insert | Insert-only function; reads admin-only |
| `email_optouts`, `email_log`, `email_queue` | RLS on, no policies | Server-only functions (unsubscribe route with its signed token, the Decisions desk behind `requireAdmin()`) |
| `hq_audit` (0020) | RLS on, no policies | Written only by the HQ adapter; never readable from a browser |
| `intern_directory` (view, 0012/0015, `security_invoker = false`) | Interns visible only to **approved startups**, with a fixed column list | `listInternDirectory(session)` checks `role = 'startup' and approved` before querying, and selects exactly the view's columns. **The column list is the privacy boundary: never add `display_name` (it holds the email)** |
| `storage.objects` bucket `avatars` | public read; write/update/delete only in `<uid>/…` | R2 key prefix `avatars/<userId>/`. Uploads go through a server route that builds the key from the session, never from the client. Reads are public URLs, or signed ones if they go private |

## What doesn't port as-is

- **Case-insensitive unique indexes** (`lower(email), submitted_at`): SQLite
  supports expression indexes, so `create unique index … on applications (lower(email), submitted_at)` works in D1.
- **`jsonb` columns** (`sheet_row`, `detail`) become `TEXT` holding JSON, read
  with `json_extract`.
- **`timestamptz`** becomes ISO-8601 `TEXT`, always written in UTC by the data layer.
- **`text[]`** (`hq_audit.target_ids`, `profiles.preferred_*`) becomes a JSON array in `TEXT`.
- **`gen_random_uuid()`**: ids are generated in the data layer (`crypto.randomUUID()`).
- **CHECK constraints** port directly (SQLite enforces them).

## Order after this document

2. `lib/data/`: one function per query, still on Supabase, with every call
   site moved onto it. HQ already works this way (`lib/data/hq/`, behind
   `getHqSource()`).
3. D1 + R2 + `wrangler.jsonc`. Each resource needs an OK before it's created.
4. Better Auth (Google + GitHub + linking). Keep the `OAuthButton` /
   `GitHubConnect` props stable.
5. Swap `lib/data/` to D1 behind the same signatures (`getHqSource()`
   returns the D1 adapter).
6. Export/import script: dry-run, counts table by table. Matthew runs the real one.
7. OpenNext + `wrangler dev`. Staging deploy only on his word.
