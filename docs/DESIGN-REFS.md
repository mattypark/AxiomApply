# Design references

## klinn.works (captured 2026-09-27)

The landing, sign-in and onboarding are a deliberate 1:1 of klinn.works with the
colour swapped from klinn's blue to Axiom forest green. Everything below was read
off the live site (computed styles + its shipped CSS), not eyeballed.

### Type

| Role | klinn | Axiom |
|---|---|---|
| Display | Instrument Serif 400, italic for the one emphasised word | same |
| Body / UI | DM Sans 400/500/600 | same |
| h1 | 46/48, -0.46px (32/36 mobile) | same |
| h2 | 40/42, -0.4px (30/34 mobile) | same |
| h3 | 32/40, -0.32px (28/32 mobile) | same |
| h4 | 500, 30px, -0.42px | same |
| body x-large / large / default | 20/26, 18/24, 17/22 | same |
| button large / small | 15/20 600, 14/20 600 | same |

All copy is lowercase, including headings and buttons. Emphasis is the italic serif
("they just can't *find you.*", "good work deserves to be *seen.*", "get in front of *them.*").

### Colour

| Token | klinn | Axiom |
|---|---|---|
| page | `#f8f9fc` | `#f7f9f8` |
| text loud | `#1b2540` | `#14231a` (15.4:1) |
| text secondary | `#1b2540b8` | `#4a5a50` (6.9:1) |
| text muted | `#1b25408f` | `#5c6a61` (5.4:1). klinn's alpha would fail AA here |
| border | `#0c264d0f` | `#0c2a1a0f` |
| accent text (section numbers) | `#015efe` | `#1f7a3c` (5.1:1) |
| signal dot | `#d0f100` | `#d0f100` (kept; it is the "live" dot) |

Hero sky (top to bottom, then fades into page):

- klinn: `#000216 0, #00042b 12, #011f58 27, #001d8a 38, #003db7 50, #0080f8 66, #5fbdf7 76, #d3effb 85, transparent 100`
- Axiom: `#000a04 0, #00140a 12, #03301a 27, #0a4a24 38, #13692f 50, #2a9447 66, #7fcf95 76, #d6f2de 85, transparent 100`

Primary button gradient:

- klinn: `#62bdff 0, #2686f5 45, #2456db 100`, solid foot `#173ca3`
- Axiom: `#4fc070 0, #1d7f3c 45, #176b33 100`, solid foot `#0e4f25`. White text at the centre stop is 5.06:1.

Dark app (sign-in right side + onboarding):

| Token | klinn | Axiom |
|---|---|---|
| canvas | `#09090a` | `#090a09` |
| card | `#121213` | `#121312` |
| sunken | `#161617` | `#161716` |
| hover | `#202124` | `#1f2220` |
| line / strong | `#1a1b1d` / `#212224` | `#1a1c1a` / `#212421` |
| text 1/2/3 | `#fff` / `#e3e4e6` / `#959597` | `#fff` / `#e3e6e4` / `#959795` |
| accent | `#6e8ae8` | `#6fcf8a` |

### Shape + motion

- Radii 6 / 8 / 12, button 14, hero card 33.6px top corners, hero inset 8px (16px ≥ sm).
- Button: h44, padding 11/22, shadows `inset 0 1px 1px #ffffffc0`,
  `inset 0 -2px 3px <tint>80`, `0 3px 0 <foot>`, `0 7px 14px <shadow>24`. Press = drop 2px and lose the foot.
- Easings: `--ease-button cubic-bezier(.6,.6,0,1)`, `--ease-mask cubic-bezier(.76,0,.24,1)`,
  `--ease-theme cubic-bezier(.66,0,.34,1)`. No animation library on klinn.
- Nav: floating pill, max ~820px. Over the hero it is transparent with white type; past
  the hero it becomes a frosted light pill (`bg-white/70` + blur + shadow) with dark type.

### Landing beats (in order)

1. Hero: pill badge, 2-line serif h1, 2-line sub, primary + secondary gloss buttons.
2. `01 / the problem`: h2 with italic 2nd line, sub whose last sentence is loud. Panel:
   skeleton applicant cards (left), 3 chat bubbles (right), "intro sent · one profile · sent by hand" foot.
3. `02 / what you get`: h2, sub, light "how it works" button. Vertical marquee of match
   cards (left), fake browser window "klinn.works · open" (right), two h4 claims under.
4. Dark rounded band: "we have already helped 30k+ people get seen", rolling digits, CTA.
5. `03 / how it works`: two-line h2, three numbered steps, CTA row with two-tone sentence.
6. `04 / the startups`: h2 + sub + CTA + "intro sent to X" toast (left), 3×3 logo tiles (right).
   Then a big two-tone sentence and the "no queue / no forms" pair.
7. `05 / what students say`: hairline rows (avatar, name, "matched w/ …" | quote).
8. `06 / questions`: accordion with + icons and hairlines.
9. Closing band on reversed sky: "get in front of *them*." + CTA, footer (logo, tagline,
   explore/connect columns in serif-italic labels, © line, "free for everyone"), giant wordmark
   bleeding off the bottom.

### Sign-in + onboarding

- `/login`: split. Left = rounded sky card with a dotted ring, logo top-left, "your next chapter",
  "good work deserves to be *seen*.", sub, "↗ build something that opens doors." foot.
  Right = dark canvas, "let's get you started", serif "welcome to klinn.", sub, gloss
  "sign in with GitHub ↗", small note, "← back to lander".
- `/onboarding`: dark app tokens, one long form in cards (who you are / what you build / resume).
  Axiom deliberately does NOT copy this part. See `components/onboarding/flow/`.
