# After you apply — HQ dashboard + applicant side

Design + product spec, 2026-09-28. Frontend only: nothing here builds backend.
The backend move is `nextsessions/backend-cloudflare.md`; the list at the end
is what that session needs from this one.

**Priority (Matthew, 2026-09-28):** the headline is **HQ**, a live dashboard
on the website where Matthew and Frank see every application, with statistics
and graphs. The Google Sheet keeps working as it does today, but as the
**backup copy**; HQ is the primary view. The applicant side (see your
application, edit it, see where it stands) comes second and is lighter here.

## The prototype

Mock data only: no requests, no Supabase, no writes, `robots: noindex`, a
"Prototype — mock data" badge on every screen, and nothing on the site links
to it. Every name is "Test Applicant …", "Demo Founder …" or "Sample Lead …",
every email is `@example.com`, every phone is 555.

| Route | What |
|---|---|
| `/preview/after-submit` | Index of the screens |
| `/preview/hq` | **HQ**: KPIs, charts, the list, the detail drawer |
| `/preview/hq/demo-not-a-real-code-7q2x` | HQ at a mock secret path. Any other code is a plain 404 |
| `/preview/after-submit/home` | Applicant home (`?status=received\|read\|accepted\|waitlist\|rejected`, `?state=none\|loading\|error`) |
| `/preview/after-submit/application` | Your application, with the edit rules |

"View as…" (bottom right) switches path (intern / startup / chapter, which
repaints the site colour), status and state. Choices go into the query string
via `replaceState`, so a link opens on the same view.

Code: `app/preview/**` and `components/preview/**`. Delete both folders to
remove the prototype; nothing else imports them.

---

## 1. HQ — the live dashboard

### Who and why

Matthew and Frank, on a laptop mostly, a phone sometimes. The questions they
open it with, in order: *how many came in, is anyone waiting too long, where
are they coming from, and who is this person?* The page answers them top to
bottom in that order.

### Access — read this before building it

Matthew wants HQ at an unguessable address: `/hq/<long random code>`. That's a
good **first layer**, and on its own it is **not enough**. HQ shows personal
information about applicants, and many of them are **minors** (names, emails,
phones, schools, grades). A secret URL leaks the moment it lands in browser
history, a screenshot, a shared-screen call, a Slack paste, a referrer header
or an extension. Once it's out, nothing tells us, and changing it is the only
fix.

**Recommended, in layers (decision for Matthew + the backend session):**

1. **Secret path.** The segment is a long random value (≥ 32 chars, from
   `crypto.randomUUID()` or similar) kept in server config, never in the repo.
   A wrong code gets the site's ordinary 404, so a guess learns nothing. It can
   be rotated without a deploy.
2. **A real sign-in gate in front of it.**
   - *Now, on Vercel + Supabase:* the existing `requireAdmin()` in
     `lib/auth.ts` (`profiles.is_admin` plus the `ADMIN_EMAILS` allowlist),
     the same gate `/admin` uses. Order: check the gate first, then the code.
     A signed-out visitor gets the same 404 either way.
   - *On Cloudflare:* **Cloudflare Access** on `/hq/*` with an email
     allowlist (Matthew + Frank's Google accounts), plus the app-level check
     as a second lock.
3. **Hygiene:** `robots: noindex, nofollow`; `Cache-Control: private, no-store`
   on the page and on every data response; no links to it anywhere (nav,
   sitemap, footer); `Referrer-Policy: no-referrer` on the route; no
   third-party scripts on it (analytics included).
4. **A record:** log who opened an applicant's contact details and who ran
   an export (who, when, which rows). The drawer already hides contact details
   behind "Show" for this reason.

The prototype's `/preview/hq/[code]` shows the 404-on-wrong-code pattern. It
has no gate, because it holds no real data.

### Layout (desktop 1446 → phone 375)

```
┌ axiom                               Home · Application · HQ ┐
│ ● Live · updates as applications arrive       /hq/<code>…   │
│ Applications                                                 │
│ [7d | 30d | 60d | All]   [All | ● Intern | ● Startup | ● Chapter]
│ ┌ Applications 162 │ This week 35 │ Unread 27 │ Median wait 3d ┐
│ ┌ Applications over time (stacked by side) ─┐ ┌ Where they stand ┐
│ │                                           │ │ funnel           │
│ ┌ By side ┐ ┌ By chapter / city ┐ ┌ By interest ┐
│ ┌ By school ──────────────────┐ ┌ By grade ┐
│ ┌ Everyone 162                                    [Export CSV] ┐
│ │ search · chapter · school · sort                             │
│ │ All · Unread · Read · Accepted · Waitlist · Not this cycle … │
│ │ table rows → click → detail drawer (right)                   │
```

- **Type and tokens:** `.ms` (Hanken), `.ms-display` for the page title and
  the KPI numbers, white 28px cards with a hairline, black `ms-pill` for the
  primary action (Export). Plain white ground (no `.ms-ground`): tables read
  better on white. Accent = `--color-ms-green`, which follows `<html data-path>`,
  so HQ turns blue or black-and-white with the site.
- **Range + side** are PathPicker-style soft tracks (`components/preview/hq/Track.tsx`,
  a sibling of `PathPicker` because PathPicker also repaints the site colour).
- **KPI strip:** one white strip with hairlines, not four cards. *Unread* turns
  red with "Overdue · oldest Nd" once the oldest unread passes 10 days, four
  days before the 14-day promise breaks.
- **Phone:** everything stacks into one column. The side track fits at 375 (the
  dots don't shrink). The table becomes two-line rows: dot, name, school ·
  chapter · date, status pill. The drawer goes full-screen. Status chips scroll
  sideways inside their own row, and the page itself never scrolls sideways
  (checked: `scrollWidth === innerWidth` at 375).

### Charts

Every chart is hand-built SVG or HTML: no chart library, no new dependency.
Each one answers one question:

| Chart | Question | Form |
|---|---|---|
| Applications over time | Is it picking up? What did the launch do? | Stacked columns per day, by side. Legend with totals, y-axis 0 / half / max, a date every ~70px |
| Where they stand | Are we keeping up? | Funnel received → read → decided → accepted, each bar a share of received, step rates printed ("79% of received") |
| By side | What's the mix? | Horizontal bars in the side colours |
| By chapter / city | Where from? | Horizontal bars, ranked |
| By interest (interns) | What do they want? | Horizontal bars, ranked (the contract's own options) |
| By school | Which schools? | Top 8 + "N more" |
| By grade | How old? | Horizontal bars in grade order (ordinal, not ranked) |

- **Cross-filtering:** click any bar to filter the whole page (KPIs, every
  chart, the list) to it, and click it again to clear. Each breakdown ignores
  its own filter, so the chapter chart still shows every chapter with the
  others dimmed. Active chart filters show as chips above the list.
- **Colour:** single-series charts use the path colour. The by-side colours
  are fixed per side, never by rank: intern `#4e9a66`, startup `#4f6fc9`,
  chapter `#9a9ea3`. I ran the dataviz validator: lightness band, CVD
  separation (worst ΔE 17.8), normal-vision floor (19.1) and contrast all
  pass. Chroma fails for chapter **by design** (the chapter path *is* black
  and white), so chapter is never identified by colour alone. The legend
  names it, the tooltip names it, the table names it, and it always stacks
  on top.
- **Marks:** 4px rounded data ends, a 2px gap between stacked segments,
  recessive gridlines. Text stays ink, never the series colour.
- **Tooltip:** one pointer handler over the whole plot (mouse and touch), and
  arrow keys once the chart has focus. The tooltip shows the day's split and
  total. It never depends on hover alone.
- **Text alternatives:** the time chart has an `aria-label` summary ("…214 in
  total, busiest Sep 14 with 19") and a "Show as table" disclosure. The bar
  charts are real lists with the numbers printed, so they are their own
  alternative.
- **Motion:** bars grow with `transform: scaleX` only, and
  `motion-reduce:transition-none` everywhere.

### The list and the drawer

- **Search** over name, email, school/company, chapter and "what they want".
  Filters: status chips, chapter, school, sort (*Newest* or *Oldest unread*,
  which is the reviewing order). 25 rows at a time with "Show 25 more": the
  real endpoint pages on the server.
- **Row → drawer** (right side on desktop, full screen on phone,
  `role="dialog"`, Esc closes, focus goes to Close and comes back to the row).
  It shows what they want (their own words, big), contact details hidden
  behind *Show*, the facts, a timeline (received → edits → read by whom →
  decision), the decision buttons and a private note.
- **Decisions** in the prototype change the page's memory only. In the real
  version a decision **never emails anyone on its own**: mail still goes out
  from the existing Decisions desk (`/admin/applications`) in batches, for
  deliverability (`docs/email-program.md`, "Decision mail").
- **Export CSV** exports the current slice, quoted throughout. A leading
  `= + - @` is defused so a spreadsheet never runs a cell as a formula. The
  real export should be logged (see Access) and should probably leave phone
  numbers out unless asked.

### Live

"Live" means the page keeps itself current without a reload: poll the stats +
first page every 30–60s and on window focus (cheap, and works on Vercel and
Workers alike). New rows **don't** jump into the table under the cursor.
Instead a pill, "3 new — show", appears above the list. Server-sent events or
Durable Objects can come later if polling ever feels slow. It won't at this
volume.

### States

| State | HQ shows |
|---|---|
| Loading | Skeleton cards in the real layout (pulse off for reduced motion) |
| Empty (no applications ever) | "No applications yet. The first one shows up here the moment it's sent." |
| Empty (filters) | "Nobody matches that." + Clear filters |
| Error | "We couldn't show applications right now. It's safe — nothing you sent is lost." + Try again |
| Partial (real only) | If one source fails (say startups), the rest render and a strip names the missing source. Never a blank page |

### Data seam (for the backend session to implement)

HQ reads through one small interface. The prototype's `components/preview/hq/stats.ts`
is the reference for the shapes: the same filters in, the same counts out.

```ts
// lib/data/hq.ts — sketch, not code in the repo
type Side = "intern" | "startup" | "chapter";
type HqStatus = "new" | "read" | "accepted" | "waitlist" | "rejected" | "withdrawn";

type HqFilters = {
  from?: string; to?: string;                 // ISO dates
  side?: Side; status?: HqStatus; q?: string;
  chapter?: string; school?: string; grade?: string; interest?: string;
};

type HqRow = {                                // one application, any side
  id: string; side: Side; name: string; email: string;
  org: string; chapter: string | null; grade: string | null; interest: string | null;
  headline: string; status: HqStatus;
  submittedAt: string; readAt: string | null; reviewer: string | null;
  decidedAt: string | null; editedAt: string | null; sheetRow: number | null;
};

interface HqSource {
  stats(f: HqFilters): Promise<{
    kpis: { total: number; thisWeek: number; lastWeek: number; unread: number;
            oldestUnreadDays: number; medianDaysToRead: number | null };
    daily: { date: string; intern: number; startup: number; chapter: number }[];
    funnel: { received: number; read: number; decided: number; accepted: number };
    by: Record<"side" | "chapter" | "school" | "grade" | "interest",
               { label: string; value: number }[]>;   // each ignores its own filter
  }>;
  list(f: HqFilters, page: { cursor?: string; size: number; sort: "newest" | "oldest-unread" })
    : Promise<{ rows: HqRow[]; next?: string; total: number }>;
  get(id: string): Promise<(HqRow & { answers: Record<string, string>; edits: Edit[] }) | null>;
  decide(id: string, status: HqStatus, by: string): Promise<{ ok: boolean }>;
  export(f: HqFilters, by: string): Promise<ReadableStream>;   // logged
}
```

- **Stats are computed on the server** (GROUP BY), not in the browser. The page
  only ever holds one page of rows, so drawing a bar never means shipping
  every minor's phone number to the client.
- **Today the adapter would normalise three tables:** `applications` (interns;
  Sheet vocabulary `applied/waitlist/accepted/rejected/withdrawn`),
  `startup_inquiries` (**no status column**; approval lives on
  `profiles.approved` and only for signed-in startups) and
  `chapter_applications` (`applied/review/approved/rejected/withdrawn`).
  `HqStatus` maps them: `applied` + no reviewer → `new`, `applied` +
  reviewer or `review` → `read`, `approved` → `accepted`.
- **Free text needs cleaning.** "City / Chapter" and "School" are typed by
  hand, so "bay area", "SF" and "Bay Area" have to be folded or the chart
  lies. The adapter needs an alias map (trim, case-fold, a small editable
  table) and an "Other" bucket. Grade vocabularies differ too ("11th grade"
  on interns, "11th" on chapters).
- **Now → later:** implement `HqSource` over Supabase first
  (`lib/data/` step 2 of the backend brief), then over D1 behind the same
  signatures. HQ's components never import a database client.

---

## 2. Applicant side (lighter)

### Signed-in home after submitting

It stays on the welcome page's `.ms-ground`, uses one big `.ms-display`
sentence and very little text. Left: where it stands, in one sentence, plus
"See your application". Right: a white card with the **status track**,
PathPicker's soft track with the flat `RocketGlyph` flying to the current stop
(engine off once there's a decision). Below: **the one next thing** and
**From us** (the mail they've had).

| | Received | Read | Accepted | Waitlist | Not this cycle |
|---|---|---|---|---|---|
| Intern | "It's in, Test." · by Oct 8 | "Matthew has read it." | "You're matched" → match card: startup, role, start, "the intro is in your inbox" | "What moves you up": add a live link | Reopens January + Learn |
| Startup | "It's in." · a few days | "Being read now." | "You're approved." → first slate of three profiles | "Not yet — soon." | Reason in the email |
| Chapter | "It's in." · a week | "In review." | "Approved." → first thirty days (week 1 / 2 / 4) | "Almost." | Reason in the email |

The stops are Received → Read → Decision (Approval for startups, In review for
chapters). **"Read" is a real signal:** the Sheet's reviewer column fills in
the moment someone picks an application up. The table has `reviewer` but no
`read_at`, which the backend needs to add (see hand-off).

The promises (14 days / a few days / a week) are exactly the ones
`components/onboarding/flow/Done.tsx` already makes.

- **No application yet** (signed in, nothing found): "Welcome back, Test." +
  "Sent one without signing in? Sign in with that same email and it shows
  up here." `getMyApplication()` already matches by email and claims the row.
- **Loading / error:** skeletons in the real layout. The error line is
  reassurance first: "It's safe — nothing you sent is lost."

### Your application — what can change

One rule an applicant can hold in their head:

| Kind | Examples | Before read | After read | After decision |
|---|---|---|---|---|
| **Open** | links (GitHub, LinkedIn, Instagram, other), résumé/file, phone | edit | edit | locked |
| **Until read** | the answers: interest, chapter, role, background, letter | edit | locked | locked |
| **Locked** | name, email (the join key), school, grade | — | — | — |

An edit **never rewrites the original**. It goes in as an update beside it,
and the reviewer sees "Edited GitHub · Sep 25 · empty → @handle" on the
drawer's timeline and an *edited* tag in the list. **Withdraw** is a quiet
link with a confirm step, and maps to the existing `withdrawn` status.

**How an edit reaches the Sheet.** The contract (`lib/apply-contract.ts`) is
frozen, so an edit can't add fields to it. Options for the backend session
(don't pick here):

| Option | How | Good | Costs |
|---|---|---|---|
| A. Re-send the whole row through the same webhook | Full payload again, new timestamp | Zero Apps Script change | Duplicate rows. Row counts and column-Y decisions land on the stale row. No field to say "this is an update" without breaking the contract. **Not recommended** |
| B. Separate "Updates" channel | New Apps Script endpoint (like `startup-submit.ts`, server-side POST) appending to an *Updates* tab: email, original timestamp, field, old, new, at. A lookup formula flags the main row | Contract untouched. The Sheet stays a complete backup. Easy to read | One more script + tab |
| C. Edits live in the database only | HQ (primary) shows them. The Sheet gets nothing, or a nightly "has updates" flag | Simplest. Fits "HQ is primary, the Sheet is backup" | The Sheet backup goes stale for edited rows |
| D. Email the team | A mail per edit | No build | Can't be reconciled; noise |

B or C. C is the natural fit now that HQ is primary; B if the Sheet has to
stay a *complete* backup. **Matthew's call.**

### Matches and intros

The accepted-intern email needs the startup, the role and the founder, and
today the Sheet doesn't carry them (`docs/email-program.md`, gap 2:
`matches`). The match card and a startup's slate both need that table. Until
it exists, the match card can't be real.

### Email touchpoints (from `docs/email-program.md`)

| Moment | Email | In-app |
|---|---|---|
| Submit | "Got it." (sent today, `sendApplicationReceived`) | Track at *Received* |
| Picked up | none (don't mail "we opened it") | Track moves to *Read* |
| Day 7, still pending | "Under review" (planned) | — |
| Decision | Accepted / Waitlist / Not this cycle, sent from the Decisions desk in batches | Track lands; the next card appears |
| Edit saved | none | "Updated N answers" on the page |

"From us" on the home lists these, with the next one greyed out ("The
decision · arrives by Oct 8"). Application mail can't be unsubscribed from
(CAN-SPAM transactional). Network news can, and the footer says so.

---

## What's reused

`PathPicker`'s look (soft track, white thumb, `ease-ms`), `SIDES` dot colours,
`usePath` / `setPath` and the PATH COLOUR tokens, `.ms` / `.ms-display` /
`.ms-pill` / `.ms-rise` / `.ms-ground`, `RocketGlyph`, the header from
`EnterShell`, `ApplicationStatus` vocabulary from `lib/applications.ts`, the
Done screen's promises. **No existing file was edited.** No CSS was added to
`globals.css`: everything is Tailwind utilities.

## Open questions for Matthew

1. **Access:** OK with *secret path **and** sign-in* (requireAdmin now,
   Cloudflare Access later)? The path alone isn't safe for minors' data.
2. Should **Frank** get an admin account now (`is_admin` + `ADMIN_EMAILS`),
   or only once Cloudflare Access is in?
3. **When is an application "read"?** When someone opens it in HQ, or only
   when they press "Mark read"? (Opening is automatic but a glance isn't a read.)
4. **Where does a decision get made:** HQ (writing back to Sheet column Y as
   the backup) or still the Sheet (HQ read-only for decisions)?
5. **Edits:** option B (Updates tab, full backup) or C (database only)? And
   is the lock table above right, e.g. should school be editable?
6. Should **exports** include phone numbers?
7. Startups: add a real status to startup applications (today approval
   is only a flag on signed-in accounts)?
8. Do applicants see **who** read it ("Matthew has read it") or just "Read"?

### Answers (Matthew, 2026-09-28/29)

1. **Access:** both locks, secret path **and** `requireAdmin()`. Built. Cloudflare Access comes later.
2. **Frank:** only once Cloudflare Access is in.
3. **Read:** only the Mark read button (plus the Sheet's reviewer column X, as before). Opening the drawer doesn't count.
4. **Decisions:** in **both** HQ and the Sheet. Each push records column Y, and an HQ decision stands until Y changes after it (`planDecision`, `lib/sheet-shared.ts`).
5. **Edits:** decided later. Nothing is built for applicant edits.
6. **Exports:** always include phone numbers, and every export is logged.
7. Startups: `startup_inquiries.status` added in `0020_hq.sql`.
8. Not asked yet.

What was built is in `docs/HQ-BACKFILL.md` (the runbook) and `lib/data/hq/`.

## Hand-off for the backend session

1. `lib/data/hq.ts` implementing `HqSource` above, over Supabase first, D1
   later, same signatures. Stats via GROUP BY on the server; list paged by
   cursor.
2. The gate: `/hq/[code]` route, `requireAdmin()` first then a constant-time
   code compare against server config; 404 for both failures;
   `Cache-Control: private, no-store`, `Referrer-Policy: no-referrer`, noindex.
   Later Cloudflare Access on `/hq/*` with the two emails.
3. Columns: `applications.read_at` (+ who), `edited_at`; a status on
   `startup_inquiries` (or a unified view); an `application_edits` table
   (id, application, field, old, new, at, by).
4. Normalisation: alias map for chapter/city and school; one grade vocabulary.
5. Audit log for contact-detail reveals and exports.
6. The edit channel (option B or C, once Matthew picks) and `withdrawn`
   from the applicant side.
7. `matches` (startup, role, founder, start date): blocks the match card and
   the accepted email.
8. Check that the `applications` mirror really fills. Per `0017_applications_shape.sql`
   the web inserts failed silently before that migration. Backfill history
   from the Sheet push, and compare counts against the Sheet before HQ is
   trusted as primary.
9. Polling endpoint for "live": stats + first page, `ETag` so an unchanged
   poll is cheap.
