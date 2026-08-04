# Apply page rebuild — build spec

Written 2026-08-03. Not built yet. Next session executes this.

## Source to port from

`~/Downloads/current-projects/applyresdiency-apply` — a working Next 16 app, not a mockup.

| File | Lines | What it gives us |
|---|---|---|
| `lib/sections.ts` | 604 | `SECTIONS: Section[]` — the whole question set as data. Types: `short_text`, `text`, `textarea`, `url`, `select`, `yes_no`, `multi_checkbox`, `cofounder_group`. Each `Question` carries `id`, `label`, `required`, `placeholder`, `helpText`, `maxLength`, `options`, and `conditional: { dependsOn, showWhen }`. |
| `components/apply/ApplyForm.tsx` | 634 | The engine — section nav, per-question rendering, conditional show/hide, autosave, "saved" state, resume-by-email. |
| `components/apply/fields.tsx` | 509 | Field primitives — underline inputs, selects, two-up checkbox grids. |
| `components/site/*` | — | Nav, Footer, Placeholder, Faq. |

**Port the engine, replace the content.** Keep the schema-driven shape; swap the questions, names, and URLs for Axiom's.

## Layout

Reference puts the form centred. Matthew wants it **left**, with a media panel on the right.

```
┌────────────┬──────────────────────────┬──────────────────────────┐
│ left rail  │ form column (LEFT)       │ media panel (RIGHT)      │
│            │                          │                          │
│ Axiom logo │ "axiom application"      │ photos / placeholders:   │
│            │ dates + note             │  · Matthew + Frank        │
│ • about you│ resume-by-email line     │  · who we are             │
│ › your work│                          │  · what we do             │
│ › why      │ [sections render here]   │  · how many people placed │
│ › progress │                          │  · what we've done so far │
│ › …        │                          │  · videos                 │
│            │                          │                          │
│ saved      │                          │ (all placeholders now,    │
│            │                          │  swappable like           │
│            │                          │  /public/welcome/shot-N)  │
└────────────┴──────────────────────────┴──────────────────────────┘
```

Split down the middle. Form does not centre.

## Line-fill animation

Every rule (field underline, section divider) starts **empty** and fills in.

- `transform: scaleX(0) → 1`, `transform-origin` alternating `left` / `right` per line so direction alternates
- Fire on scroll-in via ScrollTrigger (GSAP already a dependency), stagger down the column
- Compositor-only — `transform`, never `width`
- Target 120fps feel: short durations (~0.5s), `expo.out`
- Honour `prefers-reduced-motion` — lines start filled, no animation

## Two question sets

Both sides get a full application, chosen by role:

- **Intern** — port from `lib/apply-contract.ts` (FROZEN field names, do not rename; the Apps Script webhook and Sheet depend on them). Restructuring the UI is fine; the wire payload must stay identical.
- **Startup** — currently the 4-field verification card (`Startup name`, `LinkedIn URL`, `Social media`, `What are you looking for specifically?`). Expand into a real sectioned application in the same engine.

Write both as `SECTIONS`-style data so one engine renders both.

## Branding

- Axiom Pathways logo top-left of the rail (`/axiom-mark.png`)
- Fonts: same stack as the welcome screen — SF Pro display for headings, JetBrains Mono for the small tracked labels
- Flat white ground (dots were removed site-wide 2026-08-03)
- Green accent `--color-forest` for actions; `#F94A00` is welcome-screen only

## Answered 2026-08-03

1. **Both routes** — this layout applies to `/apply` AND `/onboarding`. One engine, two entry points.
2. The "cider" line was a typo. Ignore it entirely.
3. **Placeholders** for the right panel now; real photos swapped in later.

## Constraints

- Do not rename any field in `lib/apply-contract.ts`
- Applications should dual-write: Apps Script webhook (unchanged) **and** the Supabase `applications` table from migration 0013
- Migrations **0012 + 0013 are applied** (verified 2026-08-03): `applications` table live and empty;
  `intern_directory` view live and correctly denying anon (`42501`)
