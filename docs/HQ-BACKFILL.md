# Turning HQ on, and trusting its numbers

HQ is built (`/hq/<code>`; spec in `docs/DESIGN-AFTER-SUBMIT.md`). These are the
steps only Matthew can take, because they touch live data, secrets or the
Sheet. Nothing here has been run yet (2026-09-29).

## 1. Apply the migration

`supabase/migrations/0020_hq.sql` adds the read/decided columns, a real
startup status and the `hq_audit` log. It's guarded, so running it twice is
safe. Until it runs, HQ shows data but says read and decisions can't be saved.

Either paste it into the Supabase SQL editor for project `robmrvpacjqxvxrivrrz`,
or let Claude run it from the terminal once the CLI is on the right account:

```
! supabase logout
! supabase login                                  # the account that owns Axiom
! cd ~/axiom-pathways && supabase link --project-ref robmrvpacjqxvxrivrrz
```

(The CLI is currently logged in to an account whose projects are forremmeber,
BounceBackPickle, mushy, creatorrr and SS-Radar, which doesn't include Axiom.)

## 2. Set the secret code

In `.env.local` (and later in the host's env):

```
HQ_CODE=<output of: node -e "console.log(crypto.randomUUID()+crypto.randomUUID())">
```

At least 32 characters. Empty or short keeps HQ closed. Restart `npm run dev`.
Rotating it means changing this value; the old link then 404s.

## 3. Be an admin

HQ uses the same gate as `/admin`: `profiles.is_admin = true` for your
account **and** your email in `ADMIN_EMAILS`. Frank waits for Cloudflare Access.

Locally, Google sign-in bounces to axiomapply.com (`NEXT_PUBLIC_SITE_URL`),
so sign in on `localhost:3005/auth` with email + password (if your account has one), then open
`localhost:3005/hq/<HQ_CODE>`. Anyone else, or any other code, gets the
ordinary 404.

## 4. Backfill from the Sheet

Web inserts into `applications` failed silently before 0017, and the Sheet
push only sends name, email and decision. So most rows in the database have
no school, grade, interest or chapter, and HQ's charts would be mostly
blank until this runs.

1. In the interns Sheet, open the `Applications` tab → File → Download →
   CSV. Save it as `~/axiom-pathways/private/applications.csv`. `private/`
   is gitignored; the file holds minors' details, so never move it into the repo.
2. Check the Sheet's time zone (File → Settings). The default is America/Chicago.
3. Dry run (you, or ask Claude). It writes nothing and prints counts and row numbers only:
   ```
   node --env-file=.env.local scripts/backfill-applications.ts private/applications.csv
   ```
   The **shape check** must say "columns are where they should be". If it
   doesn't, the Sheet's columns have moved and the script refuses to write.
4. If the counts look right:
   ```
   node --env-file=.env.local scripts/backfill-applications.ts private/applications.csv --write
   ```
   It fills **blank** answer columns on rows the database already has, and
   inserts only people it has never seen: one row per person, collapsed
   exactly as the Sheet push collapses them. It never touches status,
   reviewer or the contacted flag. Running it again finds nothing left to do.
5. Delete `private/applications.csv` when done.

Why one row per person: decision mail (`lib/actions/decisions.ts`) reads each
address's newest row. A second, newer row for someone already rejected or
already written to would put them back in the queue.

## 5. Keep it filled: the Push extension

`APPS_SCRIPT_DECISIONS.gs` now also sends columns D–T, and the site fills
blanks from them. Paste the new version over the old one in the Sheet's
script editor (it defines no `onOpen`, so the menu is untouched). The apply
webhook (`APPS_SCRIPT_WEBHOOK.gs`) is **unchanged**. The site side
(`/api/sheet/decisions`) only takes effect after a deploy.

## 6. Decisions in both places

Decide in HQ or in column Y. Each push records what Y said. An HQ decision
stands until Y changes after it; then the Sheet's newer call wins. HQ's
drawer shows a note when the two disagree, so the Sheet backup can be
brought in line by hand. A decision in HQ **never emails anyone**: decision
mail still goes out from `/admin/applications`, built and sent by hand.

## Counts (fill in after the dry run)

| | Sheet | Database | Match? |
|---|---|---|---|
| Interns: rows | | | |
| Interns: people | | | |
| Startups | (their Sheet) | | |
| Chapters | (their Sheet) | | |

HQ is the primary view only once these agree.
