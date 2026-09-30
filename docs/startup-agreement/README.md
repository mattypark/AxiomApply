# Startup Partner Agreement — README

What a startup signs before Axiom sends them an intern, and why each clause is
there. The point is simple: **no startup gets an intern until it has written
down exactly what that intern will do, by when, and with whom**, and every
startup gives something back when it's over: a video testimonial and real
feedback.

> **Status: draft, not legal advice.** This is the business side written down.
> Before anyone signs it, a lawyer should turn it into the real contract, since
> most interns are **minors**, many roles are **unpaid**, and startups are in
> different states. See "Get a lawyer to check" at the bottom.

Numbers in **[brackets]** are proposed defaults. Change them in one place (the
table below) and keep the rest of this file in step.

| Term | Proposed default |
|---|---|
| Deadline to submit the three asks | **[7] days** after signing |
| Minimum internship length | **[6] weeks** |
| Minimum intern hours per week | **[5]**, maximum **[15]** during the school year |
| Mentor time per week | **[1] hour**, live (call or in person) |
| Startup reply time to the intern | **[2] business days** |
| Mid-point check-in | Week **[3]** |
| Testimonial due | **[14] days** after the internship ends |
| Video testimonial length | **[60–120] seconds** |

---

## 1. Before the match: the three asks

Within **[7] days** of signing, the startup submits **three asks**, written
so that a high-schooler could read them on day one and know what to do. They
build on what the startup already told us in its application (`role_need`,
`week_one`, `mentor`, `hours`, `start_window` in `lib/apply-sections.ts`).

Each ask has:

| Field | Example |
|---|---|
| **What** they'll build or do | "Build the waitlist page for our iOS app" |
| **Done looks like** | "Live page, form writes to our Airtable, shared in Slack" |
| **By when** | End of week 2 |
| **Skills it needs** | Basic HTML/CSS or a no-code builder |
| **Who reviews it** | The named mentor |

Rules:
- **Three asks, not one vague role.** "Help with marketing" is not an ask.
  "Write and schedule 6 TikTok scripts for launch week" is.
- At least **one ask can be finished in the first [2] weeks**, so the intern
  ships something early.
- The asks set the match: Axiom picks interns whose skills fit them, and the
  intern sees them before accepting.
- **No asks by the deadline → no match.** The startup stays in the network and
  can submit later, but it goes to the back of the queue for that cycle.

## 2. During the internship: what the startup commits to

- **A named mentor**, an adult on the team, who meets the intern **[1] hour a
  week** live and is the only person who assigns work.
- **The hours agreed**: at least **[5]**, at most **[15]** a week during the
  school year, never during school hours, and within the law for the intern's
  age and state (see §4).
- **Replies within [2] business days.** An intern waiting a week for an answer is
  the most common way an internship fails.
- **The minimum length: [6] weeks.** Ending early needs a reason and notice to
  Axiom (see §6).
- **A mid-point check-in in week [3]**: a short form to Axiom on how it's
  going, so problems surface while they can still be fixed.
- **Real work, credited.** The intern's name goes on what they shipped, and they
  can show it in their portfolio unless it's genuinely confidential (see §5).

## 3. After the internship: feedback and the testimonial

Within **[14] days** of the end date, the startup gives Axiom:

1. **A video testimonial**, **[60–120] seconds**, from the founder or mentor:
   what the intern worked on, what they shipped, and whether they'd take
   another Axiom intern. A phone video is fine; it doesn't need editing.
2. **Written feedback on the intern**: a short form (skills, reliability,
   communication, would-hire-again). The intern sees a summary of it.
3. **Feedback on Axiom**: what worked in the match and what didn't.

Usage rights: the startup lets Axiom use the testimonial, its name and its logo
on the website, social media and in grant or partner materials, and can ask
for it to be taken down later.

**If the intern appears in the video, or is named or pictured, Axiom needs the
intern's consent, and a parent's or guardian's signed release if they're
under 18.** No release, no intern on camera. The founder's own testimonial
needs no release from the intern.

## 4. Working with minors (non-negotiable)

Most interns are in high school. The startup agrees to:

- **Axiom's communication rules**: work talk happens in a shared channel or a
  thread that includes the mentor, not private 1:1 DMs with a minor. Video calls
  are scheduled, and in-person work happens in a workspace, never someone's home.
- **A background check** on the mentor if the startup or Axiom's policy
  requires one. **[Decide: always, or only for in-person roles.]**
- **Child-labor rules** for the intern's state: hours limits, work permits where
  required, and no hazardous work.
- **A parent's or guardian's sign-off** on the placement before the intern
  starts. Axiom collects it (the `guardian_*` fields on the application).
- **No money requests, no personal favours, no off-platform recruiting** of the
  intern without Axiom knowing.

Breaking §4 ends the agreement immediately (see §6).

## 5. Paid or unpaid, IP and confidentiality

- **Paid roles:** the pay agreed in the application (`paid`, `comp`) is what
  gets paid, on time.
- **Unpaid roles** have to be primarily for the intern's learning, not free
  labour. That's the legal test for unpaid internships at for-profit companies
  in the US, and it's why the asks need a mentor and a learning goal.
  **[A lawyer must check this against each startup's setup.]**
- **IP:** work made for the startup belongs to the startup. The intern keeps
  the right to describe it and show non-confidential parts in a portfolio.
- **Confidentiality:** the startup may ask the intern to sign a short, plain-
  English NDA. Axiom reviews it first; a minor's NDA also needs a guardian.

## 6. When things go wrong

| Situation | What happens |
|---|---|
| Asks not in by day [7] | No match this cycle; startup keeps its spot in the network |
| Mentor unresponsive for [5] business days | Axiom steps in; if it continues, the intern is released and re-matched |
| Startup ends early | [7] days' notice to Axiom and the intern, with a reason; the intern keeps credit for what they shipped |
| Intern stops showing up | Mentor tells Axiom; Axiom talks to the intern, then ends or re-matches |
| Any breach of §4 | Ends at once; Axiom may remove the startup from the network |
| Testimonial not delivered | One reminder; then the startup can't take another intern until it's in |

## 7. What Axiom commits to in return

- A **shortlist within [5] business days** of receiving the three asks.
- **An intro to each intern** it recommends, in writing, with their application.
- **A point of contact** for the startup and the intern for the whole internship.
- **No fees.** Axiom is a nonprofit, and the network is free for startups.

## 8. Timeline at a glance

```
Day 0         Agreement signed
Day ≤ [7]     Three asks submitted                → no asks, no match
Day ≤ [12]    Axiom sends a shortlist ([5] business days)
              Startup picks; guardian signs off; start date set
Week 1        Intern starts; mentor meets them live
Week ≤ 2      First ask shipped
Week [3]      Mid-point check-in to Axiom
Week [6]      Internship ends (minimum)
End + [14] d  Video testimonial + written feedback due
```

## 9. Where this lives in the product (later)

Nothing is built yet. When it is, the natural home is:
- **Signing:** an e-signature step after a startup is approved
  (`startup_inquiries.status = accepted`, added in `0020_hq.sql`).
- **The three asks:** a short form in the startup's home, stored beside the
  application, and shown in HQ's drawer.
- **Deadlines:** HQ flags startups whose asks or testimonial are overdue, the
  same way it flags unread applications past 10 days.
- **Testimonials:** uploaded straight to storage (R2 after the Cloudflare
  move), with the release on file before anything is published.

## Get a lawyer to check

Before this becomes a contract anyone signs:
1. **Minors:** state child-labor rules, work permits, and the guardian sign-off.
2. **Unpaid internships:** whether each startup's unpaid role passes the US
   Department of Labor's primary-beneficiary test.
3. **Media releases:** consent and release wording for anyone under 18.
4. **Liability and insurance** for in-person roles.
5. **Which law governs** (Texas, for a Texas nonprofit, is the usual default).
