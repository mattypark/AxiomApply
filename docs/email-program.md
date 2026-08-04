# Axiom Pathways — email program

Drafted 2026-08-03. Copy is ready to paste into templates. Not yet built.

---

## Sender architecture — decide before writing any code

Two Resend subdomains, two reputations. Never one.

| Domain | Class | Content |
|---|---|---|
| `tx.axiomapply.com` | Transactional | welcome, application received, accepted, not selected, startup approved |
| `news.axiomapply.com` | Marketing | cohort announcements, Learn nudges, reactivation, referral |

A rejection email must never land in spam because a Learn-module blast tanked shared reputation.

---

## Blocking schema gaps

Ranked by how many emails they block:

1. **`applications`** — status enum, `submitted_at`, `decision_reason`. Blocks "received", "accepted", "not selected". Applications currently go to a Google Sheet via Apps Script, so today there is nothing to segment or suppress against.
2. `matches` / `placements` — `matched_startup_id`, `responded_at`, `start_date`
3. `email_preferences` — topic-level opt-in (see compliance)
4. `last_active_at` — reactivation + sunset
5. `guardian_name` / `guardian_email` — collect at accept-time, not signup
6. `age_over_13` or `date_of_birth` — see COPPA below

---

## Lifecycle map

### Intern

| Email | Trigger | Timing | Success metric |
|---|---|---|---|
| **Welcome** | profile insert, role=intern | immediate | ≥25% CTR to feed or Learn in 72h |
| Feed nudge | no save after 72h | day 3 | ≥15% save 1+ role |
| Learn track start | fields set, no module, day 7 | day 7 | ≥10% module start |
| Application prompt | saved role, no application | day 10 | ≥8% apply |
| **Application received** | submit | immediate | "did you get it" replies down |
| Under review | day 7, still pending | day 7 | unsub <0.2% |
| **Accepted — matched** | status → matched | immediate | ≥85% accept in 72h |
| Match reminder | no response 48h | +48h | ≥50% of stalled convert |
| **Not selected** | status → not_selected | batch at cycle close | ≥20% reapply, unsub <0.5% |
| Reapply open | next cycle, prior not_selected | cycle open | ≥20% reapply |
| Placement week 1 / day 30 | 7d / 30d post-start | — | ≥40% / ≥30% reply |
| Referral ask | day 45 of placement | day 45 | ≥0.4 referred signups/intern |
| Reactivation | no login 60d | day 60 | ≥6% return |
| Sunset | no engagement 180d | day 180 | list stays clean |

### Startup

| Email | Trigger | Success metric |
|---|---|---|
| Application received | profile insert, role=startup | <5% "any update?" |
| **Approved** | `approved` → true | ≥60% request interns in 7d |
| Not approved / more info | declined with reason | ≥30% resubmit |
| Candidate slate | match batch ready | ≥70% respond in 5d |
| No-request nudge | approved 14d, zero requests | ≥25% request |
| Placement check-in | day 14 | ≥50% reply |
| Season wrap + rehire | season end | ≥40% request next season |

---

## Copy

Shared footer on every email. Use a virtual mailbox for `{{physical_address}}`, **never a home address**.

```
Axiom Pathways · {{physical_address}}
{{unsubscribe_url}} — stops network updates. You'll still get emails about your own application.
```

---

### 1. Intern welcome

**From:** Matthew Park \<matthew@tx.axiomapply.com\>
**Reply-To:** matthew@axiompathways.org
**Subject:** Start here.
**Alts:** "You signed up. Here's the honest version." / "12,597 internships. And the part that actually matters."
**Preheader:** The feed is open to everyone. The network isn't. Here's the difference.

```
Hey {{first_name}},

You're on Axiom. Here's how this actually works.

Two things live here.

The feed. 12,597 live internship listings, pulled automatically from
the best trackers and lists, refreshed daily. Open, free, no gate.
Apply to any of them directly. We don't take a cut and we don't
need to be involved.

The network. 10+ startups we place people into by hand — FinalDose
(YC P26), TypeOS (YC X25), Corgi (YC S24), Anvara, Tally, Topit AI,
Quarter Life Crisis, and a couple still stealth. That one runs
through an application, and we read every single one.

We don't select on GPA, school, or how the resume looks. 600+ people
are in here and most got in on what they'd built, not where they go.

Three things worth doing this week:

  1. Browse the feed. Save five roles.
     → {{feed_url}}

  2. Start one Learn track — AI, CS, or marketing.
     → {{learn_url}}

  3. Apply to the network once you have something to point at.
     → {{apply_url}}

One thing before you apply: a deployed scrappy project beats a
perfect local one. Every time. If you can send us a link to
something live, that's the strongest thing in your application.

— Matthew
Founder, Axiom Pathways

I'm a high schooler too. Reply to this and it reaches me.
```

---

### 2. Application received

**Subject:** Got it.
**Alts:** "Your application is in — here's the timeline." / "Received. Now don't refresh your inbox."
**Preheader:** 14 days, either way. And what we're actually reading for.

```
{{first_name}} —

Your application is in. Submitted {{submitted_date}}.

What happens now:

  A person reads it. Not a filter, not a keyword scan.
  You hear back within 14 days either way.
  If we match you, the next email names the startup and the role.

What we're reading for: evidence you ship. Links beat adjectives.
A repo, a deployed site, an app in a store, a video with views,
revenue, a club you actually ran. Numbers help. "Passionate about AI"
does nothing. "Built a thing, 40 people use it" does a lot.

If something changed since you hit submit — you shipped something,
finished a Learn module, a project went live — reply to this email
and it gets attached to your file. Reply is the channel. Don't
submit a second application; duplicates slow your own review down.

Nothing else to do. Keep building.

— Matthew
```

---

### 3. Accepted — matched with a startup

**Subject:** You're matched with {{startup_name}}.
**Alts:** "{{startup_name}} wants you." / "Accepted — and here's who."
**Preheader:** The role, the founder, and what has to happen in 72 hours.

```
{{first_name}} —

You're in. We matched you with {{startup_name}} —
{{startup_one_liner}}.

  Role         {{role_title}}
  Team         {{team_size}} people
  Start        {{start_window}}
  Commitment   {{hours_per_week}} hrs/week, {{location_mode}}
  Comp         {{comp_line}}

Why you, in {{founder_first_name}}'s words:
"{{match_reason}}"

Next 72 hours:

  1. Confirm. {{startup_name}} holds the seat until
     {{deadline_date}}.
     → {{accept_url}}

  2. We intro you to {{founder_first_name}} by email the same day.
     You reply first, within 24 hours. That one habit is most of
     the job.

  3. Before the first call, spend an hour on what they're building.
     Use the product. Show up with one specific question. It's not
     an interview — it's the start of work.

Two things about your first month:

Startups don't die from bad products. They die from silence. Same
goes for interns. If you're stuck for more than a day, say so out
loud in their channel. Nobody has ever been fired for that.

Ship something small in week one. Anything real. It sets the tone
for everything after.

If you're under 18: loop in a parent or guardian before you accept.
{{startup_name}} needs their sign-off on the agreement, and we'd
rather sort that now than the day before you start.

If you can't take it, tell me today. No penalty. You stay in the
network and we match you next cycle. Going quiet is the only thing
that ends it.

— Matthew
```

---

### 4. Not selected

Send as a **batch at cycle close**, never trickled. A friend getting theirs Tuesday and you Friday is worse than the no itself. Tue–Thu morning. Never Friday afternoon, never before a holiday.

**Subject:** Not this cycle.
**Alts:** "A no — and the one thing I'd change." / "We're not matching you this round."
**Preheader:** A real reason, what you keep, and when you can come back.

```
{{first_name}} —

We're not matching you this cycle. That's a real no, not a soft
one, and I'd rather say it plainly than leave you checking your
inbox for three weeks.

The part that matters: this is almost never about you not being
good enough. This round we had {{applicant_count}} applications
and {{match_count}} seats. Most of the no's came down to one of
three things.

  No link. We couldn't see anything you'd shipped — only
  descriptions of it. This is the big one.

  Timing. You wanted {{season}}, and the roles that opened
  weren't in your field.

  Too broad. "Anything at a startup" reads as no strong pull
  toward anything in particular.

You keep everything except the match:

  The feed stays open. 12,597 listings, refreshed daily. People get
  placed off the feed every week with zero help from us, and that
  counts exactly as much as anything we hand-match.
  → {{feed_url}}

  Learn stays open. Finish a track and it shows on your file next
  time.
  → {{learn_url}}

  You can reapply. Applications reopen {{next_cycle_date}}. There's
  no cap on attempts and reapplying is not held against you — a
  real chunk of our current interns are second-round.

If you do one thing between now and then, do this: ship one thing
and put it on the internet. Public URL. A tool, a site, a bot, a
newsletter with actual readers. It does not have to be impressive.
It has to exist and be reachable by someone who isn't you. That
single change moves more applications from no to yes than
everything else combined.

Reply to this if you want. I read them.

— Matthew
Founder, Axiom Pathways
```

---

### 5. Startup approved

**Subject:** {{company}} is approved.
**Alts:** "You're through review — here's how to request interns." / "Approved. 600+ interns, and how to actually use them."

```
{{contact_first_name}} —

{{company}} is approved. I read every startup application myself
before it goes live, so this is a person telling you, not a system.

You can now:

  Browse intern profiles      → {{browse_url}}
  Request people              → {{request_url}}
  Post what you're hiring for → {{post_url}}

How this works on our side:

  600+ interns. High schoolers and early college.

  We select for obsession, not credentials. The strongest people
  on here have shipped real things and have nothing on a resume to
  show for it. Read the projects before the schools — that's the
  whole reason Axiom exists.

  Requests get matched by hand. Expect 2–4 candidates within
  {{turnaround}}, not a firehose of 200.

  Most of them are minors. That means a parent or guardian signs
  the agreement, and an unpaid role has to be structured as real
  learning rather than free labor. We'll flag it if a request runs
  into that.

The founders who get the most out of this hand an intern one
narrow, real, shippable thing in week one. "Help out with growth"
goes badly for everyone. "Rebuild the onboarding email flow by
Friday" goes well.

Reply to this with what you need and I'll match it by hand. That's
still the fastest path.

— Matthew
Founder, Axiom Pathways
```

---

## Deliverability + compliance

### DMARC — currently missing

DKIM and SPF are green; without DMARC, alignment is unenforced and a lookalike can spoof `axiomapply.com`. Google/Yahoo have required DMARC for bulk senders since Feb 2024, Microsoft since May 2025. At 600+ you are not "bulk" yet; the next cohort will be.

Add at `_dmarc.axiomapply.com`, TXT:

```
v=DMARC1; p=none; rua=mailto:dmarc@axiompathways.org; fo=1; adkim=r; aspf=r
```

Ramp: `p=none` for 3 weeks while reading aggregate reports → `p=quarantine; pct=25` → `pct=100` → `p=reject`. Same record on both sending subdomains. Do not jump straight to reject — one unaligned Return-Path silently kills decision emails.

Also: register Google Postmaster Tools (only place to see real Gmail complaint rate), and point Resend's `email.bounced` / `email.complained` webhooks at Supabase so hard bounces suppress within 24h.

### CAN-SPAM

All five emails above are transactional — triggered by the recipient's own action — so the unsubscribe requirement does not technically attach. Two caveats:

1. Add one promotional line ("new cohort open, tell your friends") and it becomes commercial: needs a working opt-out and a physical postal address. Put both in every template from day one — Gmail's classifier reads their absence as a signal regardless of legal category.
2. **Physical address.** CAN-SPAM requires one. The founder is a high schooler. Do not put a home address in email going to 600 minors. Get a virtual mailbox or PO box (~$10–20/mo). This is the highest-priority operational item here.

Split unsubscribe by topic, not one global switch:
- `application-updates` — transactional, no opt-out
- `network-updates` — marketing, one-click opt-out

Someone who unsubscribes from newsletters must still receive their own rejection.

For anything on `news.axiomapply.com`, set headers manually (Resend adds these for Broadcasts but not API `send`):

```
List-Unsubscribe: <{{unsubscribe_url}}>, <mailto:unsub@axiompathways.org>
List-Unsubscribe-Post: List-Unsubscribe=One-Click
```

### Minors

- **COPPA (under 13).** Binds at under-13 and requires verifiable parental consent. The apply form starts at 9th grade but has an "Other" option and nothing blocks a 12-year-old. Correct posture is avoidance, not compliance machinery: add an age gate at signup, block under-13, state it in the ToS. Building a verifiable-parental-consent flow for a handful of edge cases is not worth it.
- **Consent quality.** Instant signup means anyone can type any address. With minors, a wrong-address welcome email is a stranger receiving mail about a kid's application. Keep instant product access, but require a confirmed email before any marketing send.
- **State minor-privacy laws** (CA, CT, TX and others) restrict targeted advertising and profiling of known minors. Concretely: never upload the intern list to Meta/Google as a custom or lookalike audience. This is the rule most likely to be broken by accident during a growth experiment.
- **GDPR Art. 8** if any EU signups: digital-consent age is 13–16 by member state.
- **Guardian consent is a placement requirement, not an email one.** Collect `guardian_name` / `guardian_email` at accept-time, not signup — asking upfront depresses conversion for no benefit. Unpaid roles at for-profit startups must also satisfy the FLSA primary-beneficiary test.
- **Reply-To is a minor-contact channel.** Every email says "reply, I read them." Put a line in the ToS about what is and isn't asked over email, and don't route replies through an inbox that chapter leads or contractors can read.

---

## What not to do

- No "We are thrilled to inform you," "unfortunately," or "we regret." The rejection works because it opens with the verdict.
- No exclamation points, no emoji. The brand's differentiator is that it doesn't perform enthusiasm.
- No "Congratulations!" subject for the accept. `You're matched with Corgi.` is more exciting because it's information.
- No fake scarcity. Real scarcity exists — state the seat count and stop.
- No résumé-culture language: "qualified candidates," "competitive applicant pool," "strong academic profile." Every one contradicts the positioning. Say shipped, built, deployed, shows up.
- No consolation-prize framing in the rejection. No "opportunity to grow."
- No stock photos, gradient banners, or "LEARN MORE →" buttons. Plain text, left-aligned, one column, system font. Renders identically everywhere and improves placement.
- No corporate signature block, no title stack, no legal disclaimer.
- No "Dear {{first_name}},". Use `{{first_name}} —`. Have a fallback: `Hey there,` beats `Hey ,`.
- **Never send from `noreply@`.** Every email here should be replyable.
- No batch-and-blast to all 600. Every email is triggered by one person's state change. The only deliberate batch is the not-selected cycle close.
- **Never optimize on open rate.** Apple MPP inflates it and half the audience is on iPhone. Welcome → CTR. Received → inbound "did you get it" replies down. Accepted → accept-within-72h. Not selected → reapply rate, with unsub as guardrail.

---

## Build order

1. Virtual mailbox + DMARC `p=none` — 20 minutes each, both today
2. Two Resend subdomains
3. Intern welcome email
4. `applications` table — everything after the welcome is blocked on it. Shipping decision emails off a Google Sheet means you cannot suppress a bounced address or segment a cycle.
