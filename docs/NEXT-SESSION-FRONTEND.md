# Next frontend session — Axiom Pathways

Written 2026-09-28; updated the same day after the rocket transition, the welcome/sign-in/flow
redesign, path colours and the dead-code sweep (all committed, nothing pushed).
Read this whole file before touching code. The backend move to Cloudflare is a
**separate** session: `nextsessions/backend-cloudflare.md`. Do not do backend
work here.

## Where things stand

- Repo `~/axiom-pathways` (Next.js 15 App Router, React 19, Tailwind v4, three,
  gsap). Branch `main`. Dev server `npm run dev` on **:3005**.
- **Nothing is pushed.** Commit after every change, authored as
  `Matthew Park <matthew.parkk0@gmail.com>`. Never `git push`, never deploy.
- **Home page (`/`) = a short copy of moonshot.computer**, and Matthew loves it.
  `app/page.tsx` composes `components/home/`:
  `HomeNav` (full-width → centred floating pill on scroll, black "Apply" pill) →
  `Hero` ("Find your passion at / Axiom", 3D rocket product on the right) →
  `Statement` (pinned; "We take it from there." turns black → green word by word
  with scroll) → `Bento` (Moonshot's "Little things" grid; numbers roll in then
  hop every 7s) → `ApplyBlock` (rocket in a white arch; Intern/Startup/Chapter
  picker repaints the rocket green/blue/black) → `HomeFaq` → `HomeFooter`.
- Home styling is scoped by the `.ms` class in `app/globals.css`: **Hanken
  Grotesk** (`--font-hanken`), `.ms-display` (500 weight, 0.96 leading,
  -0.065em — put it on the element that has the big font-size, the em resolves
  there), `.ms-pill` (black pill button), tokens `ms-ink / ms-body / ms-muted /
  ms-sky (#cfe8d6, light green) / ms-sky-soft / ms-mist / ms-green (#366645)`.
  The text green that reads on white at display size is `#4e9a66` (3.4:1).
- **3D product**: `components/product/` — the prototype rocket as a solid
  object (no flame), `Product` mounts it client-only; `paint="green|blue|black"`
  re-tints smoothly. It is a placeholder for a real product.
- **Page transition**: `components/transition/PageTransition.tsx` (mounted once
  in `app/layout.tsx`) catches every same-origin link click, runs a cover
  animation, `router.push`es, and reveals when the route key changes.
  `components/transition/rocket.ts` is the cover (2026-09-28): a flat green
  rocket launches bottom-centre with an exhaust trail, the launch cloud (solid
  body + billowing soft-edged puffs, seeded layout) rises to cover, then the
  body fades and the puffs swell/drift/dissolve from the middle out. 0.9s
  cover, 0.75s clear, transform/opacity only. Reduced motion, new tabs,
  modified clicks and same-page hash links are skipped. 4.5s safety drain.
  **Dev-only** `window.__axiomLaunch.pose("fill"|"drain", 0..1)` / `.hide()`
  poses any frame — gsap keeps its own rAF, so headless checks can't freeze it.
- **Sign-in / welcome** (`/onboarding`, `/auth`): `components/onboarding/EnterShell.tsx`
  is now the home's `.ms` system — hero green ground, white arch with the
  product rocket (`paint` follows the path). `EnterFlow` = "Welcome to Axiom",
  one line per side, `components/home/PathPicker.tsx` (shared with ApplyBlock;
  syncs `?side=` via `history.replaceState`), Google as a black `ms-pill` (`OAuthButton`; interns also get a white GitHub pill),
  "or continue without an account". `/auth` = "Welcome back" + Google + the
  email/password `<details>`.
- **Question flow** — redesigned 2026-09-28 to feel like the welcome page (see
  "Question flow design" below). Embedded (`chrome="embedded"`, dark
  workspace at `/apply`) keeps its old look. Copy is sentence case (contract
  placeholders get their capital in `field()` in `lib/apply-sections.ts` —
  the contract itself is untouched).
- **Path colour** (Matthew, 2026-09-28): the picked path is the whole site's
  secondary colour — intern green (default), startup blue, chapter black and
  white. `lib/path-theme.ts` (`usePath`, `setPath`, `PATH_PAINT`) stores it on
  `<html data-path>` + localStorage `axiom_path`; `lib/path-boot.ts` is the
  inline `<head>` script that applies it before paint (on `/onboarding`,
  `?side=` wins). "PATH COLOUR" in `globals.css` holds every token: grounds
  (`.ms-ground`), `ms-sky/ms-green`, bento tiles, statement lit/unlit, launch
  smoke + rocket, flow canvas, and the older pages' forest/sky/mint/accent.
  Any `PathPicker` click sets it; the 3D `Product` wears it unless given `paint`.
- **Welcome picture**: `components/onboarding/RocketLoop.tsx` — a true circle
  straight on the ground (no arch). The flat rocket (`components/RocketGlyph.tsx`
  over `rocket-glyph.ts`, shared with the transition and the Statement) flies
  nose-first with a blurred puff plume through Start → Intern → Full time →
  Founder (startup: Post → Interview → Hire; chapter: Found → Recruit → Lead);
  each landing lights the name and pops a picture in the centre (icons; the
  Intern stop shows a random mark from `lib/investor-logos.ts`). `/auth` keeps
  the 3D rocket.
- **Investor marks**: `lib/investor-logos.ts` is the one list (YC only today).
  Used by the loop and by `components/product/logoBurst.ts` (click the Apply
  block's 3D rocket → a logo card shoots out). **Adding a16z or any other firm
  is Matthew's call** — it reads as that firm backing Axiom — file in
  `public/logos/` + one line.
- **Statement** (`components/home/Statement.tsx`, pinned 340svh): "Apply",
  "once." rise one by one, swirl apart and fade; "We take it from there" rises
  grey, a rocket flies along the baseline drawing an underline, words take the
  path colour as it passes, and it lands upright as the full stop.
- **Transition**: 1.35s cover / 1s clear; the rocket ignites on the pad in its
  own smoke before lifting; the Axiom mark is ~80px and held ≥650ms.

## Question flow design (2026-09-28)

What you see after "Continue with Google" / "or continue without an
account". Everything is in path-colour tokens (`--path-em` for dots/trails,
`ms-green` for accent text, `ms-sky-soft` / `--path-ground-*` for fills), so
green / blue / black-and-white come free. All motion is transform / opacity /
filter; every class has a `prefers-reduced-motion` fallback (`flow-*` block in
`globals.css`, right after `.ms-flow`).

- **How the two looks coexist**: `QuestionFlow` provides `FlowLookContext`
  (`flow/look.ts`); each piece calls `useFullLook()` and picks its classes.
  Embedded branches keep the old classes verbatim. `.ms-flow` still sets the
  ground + font and re-points the dark app tokens as a safety net, but style
  new full-page pieces with the `ms-*` classes directly.
- **Header** (`FlowHeader.tsx`): EnterShell's bar — Axiom mark, "Save and
  exit" (the draft is already in localStorage). Between them
  `FlightPath.tsx`: the path picker's soft track, a path-coloured trail, and
  the flat `RocketGlyph` (nose right) riding its front. One evenly spaced stop
  per section (the last is the send); a stop pops and lights when reached,
  section names under it go quiet → ink (`lg` up only). Flame roars ~0.9s
  after each move. On phones the track is its own row under the bar.
- **Question** (`FullQuestion.tsx`): dot + section name (+ "Optional"), the
  label in `.ms-display` rising word by word (`RiseWords.tsx`, `.flow-rise`,
  comes down from above when going Back), help line, answer, black `ms-pill`
  OK + underlined Back. Reactions are a small white pill; errors a white pill
  in `#b3261e`.
- **Inputs**: text = white pill the size of the welcome's Continue buttons;
  textarea = white 28px card with the hint inside; file = dashed soft card →
  white card with a path-coloured ✓. `choices.tsx`: single choice is the
  PathPicker track with one white thumb sliding by whole cells (`.flow-thumb`;
  2 options inline, >5 two columns from `sm`); multi gives each pick its own
  thumb that springs in (`.flow-pop`); startup picks are soft tiles that lift
  on hover. Letter keys pick, arrow keys walk focus, Enter on a focused option
  selects. Single choice advances after 420ms so the thumb lands first.
- **Section card** (`Interstitial.tsx` → `Landing`): the RocketLoop landing —
  a dotted route of stops, the rocket hops (arc + flame) from the last stop to
  this one, the stop pops, the title rises word by word. 2.1s, any key/tap
  skips; not shown under reduced motion (unchanged). It has no ground of its
  own: the question isn't rendered behind it, and a transformed element can't
  hold a fixed background.
- **Founder card** (`ProfileCard.tsx`, `LOOK` map): white 28px card, sticky
  and centred beside the question (and through the long review).
- **Review**: "Read it *back.*" rising, one white card per section.
- **Result** (`Done.tsx` → `FullDone`, `Launch.tsx`): the rocket climbs from
  below the screen and out of the top through a smoke column (fixed overlay,
  no clicks, hidden under reduced motion), then "A person reads this one,
  *Name*." rises in, the steps card, the pills, and the finished card.

## Rules that bite (read before editing)

- `lib/apply-contract.ts` is a **frozen wire contract** (Apps Script + Sheet).
  Never rename a field; `lib/apply-sections.ts` throws at load if one drifts.
- **Never test by really submitting an application** — it writes the live
  Sheet. To see the result screen, fill the hidden `#company-website-url` trap
  input and press send: success UI, zero requests.
- Never read or print `.env*`. Ship `.env.example` changes only.
- Fonts: Hanken Grotesk (home + anything restyled to match), DM Sans +
  Instrument Serif elsewhere, JetBrains Mono app-only. **No new typefaces
  without asking.** Don't add dependencies without asking.
- Match surrounding code: comments explain *why*, not "added X".
- Honour `prefers-reduced-motion` in every animation.

## How to verify (what actually works on this Mac)

- The `chrome-devtools` MCP **can** reach `localhost:3005`; Claude-in-Chrome
  **cannot** reach localhost. Use `mcp__chrome-devtools__*` (navigate, emulate
  `375x812x2,mobile,touch`, `evaluate_script`, `take_screenshot`).
- Check 1446×840 desktop and 375 mobile; confirm `scrollWidth === innerWidth`.
- `npx tsc --noEmit` after edits. `next build` **writes into the dev server's
  `.next` and breaks it**: stop the dev task first, build, restart dev.
- Home first-load JS is ~159 kB (target 150). three lives in a lazy chunk —
  keep it out of the first load.
- Navigate the devtools tab to `about:blank` when done.

## Open items to ask Matthew about (don't just do them)

- `/about` has no `page.tsx` (404) — pre-existing, only `about/internships` and
  `about/learn` exist.
- Supabase: GitHub linking in the flow needs "manual linking" enabled (his toggle).
- The 20-item launch checklist (`~/.claude/rules/10-launch-checklist.md`) has
  not been walked for this design.
- He'll send new UI references later; the private applicant dashboard for him
  and Frank is planned (behind real auth — Cloudflare Access), not started.

## Handoff — end of 2026-09-28 session (read first)

**Done and committed (nothing pushed):** rocket page transition (slower, ignition,
smoke keeps churning while the route loads, mark fades only); welcome page
(RocketLoop circle, Recommended! note that writes itself on); home apply block
signs you in directly (Google; GitHub + pulsing Recommended! for interns;
"or apply without an account" → `/onboarding?side=…&start=1` straight into the
flow); path colour site-wide; question flow redesign (see "Question flow design"
above); investor marks (`lib/investor-logos.ts`, cropped symbols in
`public/logos/investors/*-mark.svg`); HQ dashboard + after-submit prototypes on
MOCK data at `/preview/hq` and `/preview/after-submit` (spec:
`docs/DESIGN-AFTER-SUBMIT.md`).

**The live dashboard is NOT live.** `/preview/hq` is a mock-data prototype with no
auth gate (noindex only). Do not load real Sheet/Supabase data into it. Before any
real data: the backend session builds the data layer (`lib/data/hq.ts` interface in
the spec), the `/hq/[code]` route with `requireAdmin()` + secret code (Cloudflare
Access later), and backfills Supabase `applications` from the Sheet (web inserts
failed silently before migration 0017 — compare counts first). Matthew's open
decisions are listed in the spec.

**Next session, in order:**
1. Backend (separate session, `nextsessions/backend-cloudflare.md`): HQ data layer +
   gate + Sheet backfill; keep the Sheet as the backup write.
2. GitHub sign-in: today it's plain Supabase OAuth (`OAuthButton`,
   `GitHubConnect`). Matthew wants GitHub (and maybe Google) connected via
   **Composio** — research it (`composio` skill), decide Supabase-vs-Composio with
   him, then wire. The Supabase GitHub provider is still off (his toggle).
3. a16z: its site has no short mark any more (header = "ANDREESSEN HOROWITZ",
   favicon = star symbol). It's set as a plain "a16z" name SVG — ask Matthew if he'd
   rather have the star symbol.
4. Not yet re-checked in the browser: the new square investor marks inside the
   loop card and the click burst; reduced-motion on the new flow.
5. Dev server: restart it every few hours — the long-running webpack dev server
   grew to 5.5 GB this session. Consider `next dev --turbopack` (ask first).
