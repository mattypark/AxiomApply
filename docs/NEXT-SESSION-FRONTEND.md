# Next frontend session — Axiom Pathways

Written 2026-09-28 at the end of a long session, so the next one starts warm.
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
  `components/transition/liquid.ts` is the current cover (green liquid, ported
  from Matthew's portfolio). Reduced motion, new tabs, modified clicks and
  same-page hash links are skipped. 4.5s safety drain.

## Task 1 — the transition should feel like a rocket blasting off

Matthew loves the page transition but wants it to read as **a rocket ship
blasting**, not liquid. Keep it **green** (current fills `#295337` front /
`#1a3a27` back; the home's light green is `#cfe8d6`).

Direction that fits what exists (pick and build one, show him, iterate):
- Click → a green rocket (reuse the silhouette, as SVG, or the three product)
  launches from bottom-centre; its **exhaust plume** billows out behind it as
  big soft puffs that grow, merge and **cover the screen bottom → top** as the
  rocket exits the top. The Axiom mark can sit on the covered frame, as now.
- Route changes under the smoke; then the smoke **thins and clears** (puffs
  scale/fade upward, or part in the middle) to reveal the page.
- ~0.9s cover, ~0.75s reveal (today's timings). GSAP is installed. A canvas or
  SVG with ~30–60 puff circles plus a blur/gooey filter is the usual way to get
  merging smoke; keep it transform/opacity-only per frame.
- Keep all the click-capture rules in `PageTransition.tsx`; only replace what
  `createLiquid()` does (same `fill(onComplete)` / `drain(onComplete)` shape).
- `prefers-reduced-motion`: no transition at all (current behaviour).

## Task 2 — redesign the sign-in / welcome page (`/onboarding`, `/auth`)

Matthew: "not what I want it to look like — same fonts as the home page, more
simple, less text, change something up for the UI."

Today: `components/onboarding/EnterShell.tsx` (dark split screen, green sky card
with dot ring on the left, "good work deserves to be seen.") +
`EnterFlow.tsx` (welcome copy, `GoogleButton`, "continue without an account",
cross-links to startup/chapter, back link). `/auth` reuses the shell.

Make it feel like the home page:
- Wrap in `.ms` → Hanken Grotesk, light green ground, black `ms-pill` buttons.
- **Much less text**: one headline, one short line, the Google button, a small
  "continue without an account". Drop the paragraph-long intro, the "one
  account for…" line, "your next chapter", "build something that opens doors".
- Side choice (intern / startup / chapter) as the same sliding picker the
  ApplyBlock uses, instead of a sentence of links — and repaint the product
  rocket with it, like the home does. The product rocket is a good hero here.
- Keep the behaviour: `GoogleButton` → `signInWithOAuth({provider:"google"})`
  via `authCallbackUrl(next)`; signed-in users skip straight into the flow;
  "continue without an account" must still reach every question.
- Probably also restyle the question flow (`components/onboarding/flow/`, dark
  canvas, Instrument Serif) to match — **ask Matthew first**, he only named the
  welcome page.

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

- **Delete dead code?** Unused since the Moonshot home:
  `components/welcome/WelcomeSections.tsx`, `welcome/MenuPill.tsx`,
  `welcome/scroll/{SiteFooter,DotsField}.tsx`, `components/hero/{GradientHero,HeroNav}.tsx`,
  `components/story/StorySection.tsx`, `components/rocket/*` (particle story),
  `components/sections/{ProblemSection,WhatYouGetSection,InsideTheWorkSection,
  CountBanner,HowItWorksSection,StartupsSection,QuestionsSection,ClosingCta,IntroToast,SectionIcon}.tsx`,
  `lib/media-manifest.ts`. Still live: `hero/DotArc` (EnterShell),
  `sections/SectionHead` (for-startups etc.), `welcome/CookieBanner` (home),
  `apply/ApplyStepper` (re-exports `submittedKey` for LocalApplicationBadge).
  Grep before deleting; deletion needs his OK.
- Supabase: GitHub linking in the flow needs "manual linking" enabled (his toggle).
- The 20-item launch checklist (`~/.claude/rules/10-launch-checklist.md`) has
  not been walked for this design.
- He'll send new UI references later; the private applicant dashboard for him
  and Frank is planned (behind real auth — Cloudflare Access), not started.
