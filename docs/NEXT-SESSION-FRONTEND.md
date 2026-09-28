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
  syncs `?side=` via `history.replaceState`), Google as a black `ms-pill`,
  "or continue without an account". `/auth` = "Welcome back" + Google + the
  email/password `<details>`.
- **Question flow** (full-page only): `.ms-flow` in `app/globals.css` re-points
  the dark `--color-app-*` tokens + `--font-display` to the light system,
  turns `.btn-gloss` into a black pill and `em` into the path colour. Embedded
  (`chrome="embedded"`, dark workspace) keeps its colours. Copy is sentence
  case now (contract placeholders get their capital in `field()` in
  `lib/apply-sections.ts` — the contract itself is untouched).
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
