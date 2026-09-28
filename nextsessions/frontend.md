# Paste this into a fresh Claude Code session (frontend)

```
Frontend session for Axiom Pathways in ~/axiom-pathways (dev server: npm run dev
on :3005). Before doing anything, read docs/NEXT-SESSION-FRONTEND.md in full —
it has the current state, the rules that bite, and how to verify on this Mac.
Also skim docs/DESIGN-REFS.md.

Two tasks, in this order:

1. Page transition: I love the current one, but make it feel like a rocket ship
   blasting off instead of liquid — a green rocket launching up with its exhaust
   smoke covering the screen, the page changing under the smoke, then the smoke
   clearing. Keep it green. Replace only the cover animation in
   components/transition/ (keep PageTransition.tsx's click rules).

2. Redesign the sign-in / welcome page (/onboarding and /auth). It should use the
   same fonts and feel as the home page (Hanken Grotesk, light green, black pill
   buttons), be much simpler with far less text, and change up the UI — e.g. the
   same intern/startup/chapter sliding picker and 3D rocket the home's apply
   block uses. Keep the Google sign-in and "continue without an account"
   behaviour. Ask me before restyling the question flow itself.

Rules: commit after every change as Matthew Park <matthew.parkk0@gmail.com>,
never push or deploy, never submit a real application (live Google Sheet), no
new fonts or dependencies without asking, honour prefers-reduced-motion. Verify
with the chrome-devtools MCP at 1446x840 and 375 mobile, send me screenshots,
and close the page when done. The backend (Cloudflare move) is a separate
session — don't touch it.
```
