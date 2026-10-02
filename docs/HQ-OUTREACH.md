# HQ · YC outreach desk

`/hq/<code>/outreach`: every company in YC's Winter, Spring, Summer and Fall
2026 batches, its founders and their LinkedIns, the email drafted for it, the
money it raised, and where outreach stands. Same two locks as the rest of HQ
(signed-in admin, then the HQ code); anything else is the ordinary 404.

Nothing sends from here. Sending is the Google Sheet mailer in the
`axiom-yc-outreach` repo, which reads the CSV this page exports.

## Where the data comes from

The separate, private `mattypark/axiom-yc-outreach` tool scrapes the
directory, finds contacts, drafts the emails and researches funding. Its
`npm run bundle` writes `out/hq-bundle.json`.

**This repo is public.** The bundle holds founders' names and addresses, so
it only ever lives in `private/` (gitignored) and in the `yc_outreach` table,
which has RLS on and no policies: only HQ's server routes, through the
service role, can read it.

## Turn it on (once)

1. Apply `supabase/migrations/0021_yc_outreach.sql` (Supabase SQL editor, or
   `supabase db push` once the CLI is logged into Axiom's project).
2. Copy the bundle in:
   `cp ~/Downloads/current-projects/axiom-yc-outreach/out/hq-bundle.json private/outreach/`
3. Dry run, then write:

   ```bash
   node --env-file=.env.local scripts/import-outreach.ts private/outreach/hq-bundle.json
   node --env-file=.env.local scripts/import-outreach.ts private/outreach/hq-bundle.json --write
   ```

Re-running is safe. New companies come in whole; companies already in the
table get fresh company, draft and funding data, but their status, notes and
send-to address stay as HQ left them.

## Using it

- **Sheet**: scan everything: logo, founders + LinkedIn, best address with
  the drafted subject under it, raise, links, status.
- **Emails**: read every draft in full beside who it's for. Approve, Copy,
  Pass, or open Details.
- **Details** drawer: description, every founder with bio and alternate
  address patterns, inboxes, a send-to override, job posts, funding with its
  source, the draft, notes (save as you type).
- Filters: batch, status, email quality, raised beyond YC, hiring, and
  "says something about you" (openers that claim something about Matthew —
  approve those only if they're true).
- **Export these as CSV** → import into the mailer Sheet.

## Checking the UI without signing in

`npm run dev`, then `/preview/hq/outreach` renders the same desk over
`private/outreach/hq-bundle.json` in memory. It 404s in production.
