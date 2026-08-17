# Sheet-only decision mailer

Sends the rejection and waitlist emails straight from the `interns axioms`
Sheet, through Resend, with no website and no database in the loop.

This is a **second, independent path**. The site path
(`Axiom → 📤 Push decisions to site` → `/admin/applications`) still works and
is untouched. Use one or the other for a given batch — running both mails
people twice, because neither knows what the other sent.

## Which path to use

| | this one | the site |
|---|---|---|
| Moving parts | one Apps Script | Sheet + API route + Postgres + admin page |
| Review before sending | a preview tab in the Sheet | rendered copy on the admin page |
| Double-send protection | an `Emailed` column in the Sheet | unique index in Postgres |
| Hard bounces / complaints | you read them in Resend, nothing acts on them | suppressed automatically on future sends |
| Unsubscribes | replies only | honoured automatically |
| Needs a deploy | no | yes |

For one batch, this is the simpler and safer-to-operate choice. For a program
that keeps running, the suppression list is the thing you miss first — mailing
an address that hard-bounced, cycle after cycle, is how a sending domain's
reputation dies.

## Install

1. Sheet → **Extensions → Apps Script**
2. **Files → + → Script** three times, named `Config`, `Copy`, `SendDecisions`,
   and paste the matching `.gs` file into each
3. **Project Settings → Script properties** → add `RESEND_API_KEY`
4. In `SortApplicants.gs`, inside the existing `onOpen` chain, add:

   ```js
   .addSeparator()
   .addItem('👁 Preview decision emails', 'previewDecisionEmails')
   .addItem('✉️ Send next batch', 'sendNextDecisionBatch')
   ```

   Chained onto the line above, like every other item. A bare
   `menu.addItem(...)` statement throws and the whole Axiom menu disappears.

   Do **not** add a second `onOpen` anywhere — Apps Script keeps only the last
   one defined across the project.

5. Reload the Sheet.

## Before the first send

Open `Config.gs` and check every value, in this order:

- `CYCLE` — applications, seats, season, reopen date. These appear **word for
  word** in the copy. `applicantCount` and `matchCount` are numbers applicants
  compare with each other.
- `FROM` — the domain must be **Verified in Resend, spelled exactly**. A
  subdomain is a separate domain there: `axiomapply.com` being verified does
  not cover `tx.axiomapply.com`. The address itself needs no mailbox.
- `REPLY_TO` — where replies actually land. The copy says "reply to this",
  and people will.
- `POSTAL` — a real street address you receive mail at. CAN-SPAM requires it,
  it prints in every footer, and it must never be a home address: this mail
  goes to hundreds of minors and their parents.

## Running it

**Axiom → 👁 Preview decision emails.** Writes an `email preview` tab: one row
per recipient with the full text they would receive, the next batch marked, and
any unreadable decisions listed by row number. Sends nothing. Read the copy
here — it is exactly what goes out.

**Axiom → ✉️ Send next batch.** Confirms the count and the first recipient,
then sends `BATCH_SIZE` (90) emails and writes `Emailed` + `Emailed At` back to
each row. Run it again the next day for the next batch.

Resend's free plan allows 100 emails a day and 3,000 a month, so ~660 people
takes about eight days. A paid plan clears it in two runs — but spreading the
send is good practice anyway: a domain with no sending history that suddenly
emits 600 messages is the classic spam-filter trigger.

## Who gets what

Read from **column Y**, by position:

| Column Y | Email |
|---|---|
| `Rejected` | rejection |
| `waitlist` | waitlist |
| blank | waitlist |
| `Accepted` | **none** — needs startup, role, founder and an accept link the Sheet doesn't carry, so you write those |
| `withdrawn` | none |
| anything else | **none**, and listed in the preview by row number |

Also held back, whatever column Y says:

- anyone on a tab whose name contains `sent out` — already written to by hand
- anyone whose `Emailed` cell is filled
- rows with no email in column C, which is the 418–457 block written under an
  older column layout that put the address in K, M or Z

Duplicate addresses collapse to one person.

## The column layout is load-bearing

Positions are read by index, not by header text, because the header row drifted
long ago: row 1 labels column J "Status" while J holds essay text, and the real
decision chip is in Y with **no header at all**.

Do not repair the header row. Do not insert or reorder columns. Adding columns
to the **right** of the last one is safe — that is exactly what `Emailed` and
`Emailed At` do. Anything else shifts `COL` in `Config.gs` and the mailer reads
the wrong cells.

## If something goes wrong

Failures never throw. The row stays unmarked and the next run retries it.

A bad key, an unverified sending domain, or a daily cap fails the same way for
every recipient, so the run stops on the first of those rather than burning the
batch on one error. The alert names the failures; the full response is in
**View → Executions**.

To deliberately re-send to someone, clear their `Emailed` cell.
