# Axiom Pathways

Nonprofit that places high schoolers and early-college students into real
startup work. Two things live here: an open **feed** of internship listings,
and a hand-matched **network** you apply to.

Next.js 15 (App Router) · Supabase · Resend · Tailwind v4 · GSAP + Framer Motion.

> The Astro build this replaced is preserved in git history. The live site at
> `axiomapply.com` is still that build — **this rebuild has not been pushed.**

---

## Run it

```bash
cp .env.example .env.local      # then paste real values in
npm install
npm run dev                     # http://localhost:3005
```

Everything degrades gracefully without keys: no Supabase means anonymous
browsing only, no Resend means email sends return
`skipped: email-not-configured` instead of failing.

---

## Surfaces

| Route | What it is |
|---|---|
| `/` | Welcome screen — preloader, orbiting founder ring, then the ported scroll sections (feed / network / Learn, how it works, pinned gradient slides, FAQ, dot-field footer) |
| `/onboarding` | "Which side are you on?" T-picker → the chosen application, in place |
| `/apply` | The intern application, inside the workspace shell |
| `/home` | Intern workspace dashboard — quick actions, profile-strength signals, live feed + reading |
| `/internships` `/learn` `/articles` `/account` | Intern surfaces, behind the workspace rail |
| `/startup/*` | Startup dashboard — gated on `profiles.approved`, flipped by hand |
| `/admin/*` | Article + source management, gated on `is_admin` + `ADMIN_EMAILS` |

---

## Architecture worth knowing before editing

### The frozen apply contract
`lib/apply-contract.ts` is the **wire format** the Google Apps Script webhook
and the Sheet expect. Field names and option strings are frozen.

`lib/apply-sections.ts` builds the intern question set *from* that contract via
a `field()` lookup that **throws at module load** if a name does not exist. So
the UI can be restructured freely, but a rename breaks the build rather than
silently breaking the Sheet.

### One engine, two applications
`components/apply/ApplyEngine.tsx` renders both question sets off data.

- `variant="dark"` — the startup side runs on a night surface. Colours come
  from the `.apply-dark` token scope in `globals.css`; the components
  themselves are theme-agnostic.
- `chrome="embedded"` — drops the engine's own rail and scroll containers so it
  can live inside the workspace shell (`/apply`). `chrome="full"` is the
  standalone layout used by `/onboarding`.

### Dual write on submit
1. Browser POSTs to the Apps Script webhook — frozen, fire-and-forget,
   `mode: "no-cors"` (`lib/apply-submit.ts`).
2. A server action mirrors the same answers into Supabase `applications`
   (`lib/actions/applications.ts`), using the service-role client because the
   form works signed-out.

The Sheet is authoritative. A Supabase failure is swallowed so nobody is told
their application failed when it did not.

### Scroll containers and Lenis
Lenis intercepts wheel events at the document level. Any nested
`overflow-y-auto` container **must** carry `data-lenis-prevent` or it will look
completely broken — programmatic scrolling works, the wheel does nothing.

### Pinned slides
Each `.list__main__slide` is exactly `100vh`, and the pin length must stay one
viewport. A longer pin desyncs the spacers and the cards float over the FAQ.
The zoom-then-lean order and the fade all live inside that one pin timeline.

### Email
`lib/email/` — `client.ts` (Resend REST, no SDK), `templates.ts` (plain text),
`send.ts` (suppression → send → log), `unsubscribe.ts` (HMAC-signed links).
Two sender subdomains: `tx.` transactional, `news.` marketing. Never
`noreply@` — every email is replyable.

---

## Migrations

`supabase/migrations/`. 0001–0013 applied. **0014_email.sql is written but not
applied** — apply it before testing email or every send fails its log step.

---

## Conventions

- Pretty code, never minified.
- Comments explain *why*, not what changed.
- No secrets in the repo. `.env.local` is gitignored; `.env.example` carries
  the key names only.
- No commits or pushes without explicit sign-off.

---

## What is not done

See **`docs/NEXT-SESSION.md`** — account/profile rebuild, live backend
verification, and the Vercel + DNS setup, with a paste-ready prompt to resume.

Also open: `/public/media/` still holds placeholder imagery that is not ours
to publish (fine while building, not fine in production), the feature video
needs compressing, and `12,597` is hardcoded copy.
