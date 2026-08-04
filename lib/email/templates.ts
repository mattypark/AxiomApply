import "server-only";

/**
 * Email copy, straight from docs/email-program.md.
 *
 * Rules that live in the copy and must survive editing:
 *   · plain text, left aligned, one column — renders identically everywhere
 *   · `{{first_name}} —`, never "Dear". Fallback greeting when the name is missing
 *   · verdict first. No "we are thrilled", "unfortunately", or "we regret"
 *   · no exclamation points, no emoji, no résumé-culture language
 *   · never send from noreply@ — every one of these is replyable
 */

const SITE = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://axiomapply.com";

/**
 * CAN-SPAM requires a postal address. The founder is a high schooler and this
 * mail goes to minors — use a virtual mailbox or PO box here, never a home
 * address. Left obviously unset so a placeholder cannot ship silently.
 */
const POSTAL_ADDRESS =
  process.env.EMAIL_POSTAL_ADDRESS?.trim() || "[postal address not configured]";

export type Footer = {
  /** Marketing sends must pass one. Transactional sends omit it. */
  unsubscribeUrl?: string;
};

function footer({ unsubscribeUrl }: Footer): string {
  const lines = [`Axiom Pathways · ${POSTAL_ADDRESS}`];
  if (unsubscribeUrl) {
    lines.push(
      `${unsubscribeUrl} — stops network updates. You'll still get emails about your own application.`,
    );
  }
  return `\n\n--\n${lines.join("\n")}\n`;
}

function greeting(firstName?: string): string {
  const name = firstName?.trim().split(/\s+/)[0];
  return name ? `${name} —` : "Hey there,";
}

export type Email = {
  subject: string;
  text: string;
};

/* ------------------------------------------------------------------ */
/* 1. intern welcome                                                   */
/* ------------------------------------------------------------------ */

export function internWelcome(vars: {
  firstName?: string;
  unsubscribeUrl?: string;
}): Email {
  return {
    subject: "Start here.",
    text: `${greeting(vars.firstName)}

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
     → ${SITE}/internships

  2. Start one Learn track — AI, CS, or marketing.
     → ${SITE}/learn

  3. Apply to the network once you have something to point at.
     → ${SITE}/apply

One thing before you apply: a deployed scrappy project beats a
perfect local one. Every time. If you can send us a link to
something live, that's the strongest thing in your application.

— Matthew
Founder, Axiom Pathways

I'm a high schooler too. Reply to this and it reaches me.${footer({
      unsubscribeUrl: vars.unsubscribeUrl,
    })}`,
  };
}

/* ------------------------------------------------------------------ */
/* 1b. account created — email signup                                  */
/* ------------------------------------------------------------------ */

/**
 * Fires the moment an email+password account is created (Google users get
 * their welcome from the same place, one step later). Deliberately short:
 * the long orientation is the welcome email, this one just confirms the
 * account exists and points at the one next step.
 */
export function accountCreated(vars: { firstName?: string }): Email {
  return {
    subject: "You're in.",
    text: `${greeting(vars.firstName)}

Your Axiom account is live. Glad to have you here.

Two things you can do right now:

  1. Browse the feed — thousands of live internship listings,
     refreshed daily, open with no gate at all.
     → ${SITE}/internships

  2. Apply to the network when you're ready. One application,
     read by a person, answered within 14 days either way.
     → ${SITE}/apply

Nothing to pay, nothing to unlock. We're a nonprofit; the whole
thing is free.

If something looks broken or you just want to say hello, reply to
this email — it reaches a person.

— Matthew
Founder, Axiom Pathways${footer({})}`,
  };
}

/* ------------------------------------------------------------------ */
/* 2. application received                                             */
/* ------------------------------------------------------------------ */

export function applicationReceived(vars: {
  firstName?: string;
  submittedDate: string;
}): Email {
  return {
    subject: "Got it.",
    text: `${greeting(vars.firstName)}

Your application is in. Submitted ${vars.submittedDate}.

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

— Matthew${footer({})}`,
  };
}

/* ------------------------------------------------------------------ */
/* 3. accepted — matched                                               */
/* ------------------------------------------------------------------ */

export type MatchVars = {
  firstName?: string;
  startupName: string;
  startupOneLiner: string;
  roleTitle: string;
  teamSize: string;
  startWindow: string;
  hoursPerWeek: string;
  locationMode: string;
  compLine: string;
  founderFirstName: string;
  matchReason: string;
  deadlineDate: string;
  acceptUrl: string;
};

export function accepted(vars: MatchVars): Email {
  return {
    subject: `You're matched with ${vars.startupName}.`,
    text: `${greeting(vars.firstName)}

You're in. We matched you with ${vars.startupName} —
${vars.startupOneLiner}.

  Role         ${vars.roleTitle}
  Team         ${vars.teamSize} people
  Start        ${vars.startWindow}
  Commitment   ${vars.hoursPerWeek} hrs/week, ${vars.locationMode}
  Comp         ${vars.compLine}

Why you, in ${vars.founderFirstName}'s words:
"${vars.matchReason}"

Next 72 hours:

  1. Confirm. ${vars.startupName} holds the seat until
     ${vars.deadlineDate}.
     → ${vars.acceptUrl}

  2. We intro you to ${vars.founderFirstName} by email the same day.
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
${vars.startupName} needs their sign-off on the agreement, and we'd
rather sort that now than the day before you start.

If you can't take it, tell me today. No penalty. You stay in the
network and we match you next cycle. Going quiet is the only thing
that ends it.

— Matthew${footer({})}`,
  };
}

/* ------------------------------------------------------------------ */
/* 4. not selected                                                     */
/* ------------------------------------------------------------------ */

export type NotSelectedVars = {
  firstName?: string;
  applicantCount: string;
  matchCount: string;
  season: string;
  nextCycleDate: string;
};

export function notSelected(vars: NotSelectedVars): Email {
  return {
    subject: "Not this cycle.",
    text: `${greeting(vars.firstName)}

We're not matching you this cycle. That's a real no, not a soft
one, and I'd rather say it plainly than leave you checking your
inbox for three weeks.

The part that matters: this is almost never about you not being
good enough. This round we had ${vars.applicantCount} applications
and ${vars.matchCount} seats. Most of the no's came down to one of
three things.

  No link. We couldn't see anything you'd shipped — only
  descriptions of it. This is the big one.

  Timing. You wanted ${vars.season}, and the roles that opened
  weren't in your field.

  Too broad. "Anything at a startup" reads as no strong pull
  toward anything in particular.

You keep everything except the match:

  The feed stays open. 12,597 listings, refreshed daily. People get
  placed off the feed every week with zero help from us, and that
  counts exactly as much as anything we hand-match.
  → ${SITE}/internships

  Learn stays open. Finish a track and it shows on your file next
  time.
  → ${SITE}/learn

  You can reapply. Applications reopen ${vars.nextCycleDate}. There's
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
Founder, Axiom Pathways${footer({})}`,
  };
}

/* ------------------------------------------------------------------ */
/* 5. startup approved                                                 */
/* ------------------------------------------------------------------ */

export function startupApproved(vars: {
  contactFirstName?: string;
  company: string;
  turnaround: string;
}): Email {
  return {
    subject: `${vars.company} is approved.`,
    text: `${greeting(vars.contactFirstName)}

${vars.company} is approved. I read every startup application myself
before it goes live, so this is a person telling you, not a system.

You can now:

  Browse intern profiles      → ${SITE}/startup/interns
  Request people              → ${SITE}/startup/home
  Post what you're hiring for → ${SITE}/startup/home

How this works on our side:

  600+ interns. High schoolers and early college.

  We select for obsession, not credentials. The strongest people
  on here have shipped real things and have nothing on a resume to
  show for it. Read the projects before the schools — that's the
  whole reason Axiom exists.

  Requests get matched by hand. Expect 2–4 candidates within
  ${vars.turnaround}, not a firehose of 200.

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
Founder, Axiom Pathways${footer({})}`,
  };
}

/* ------------------------------------------------------------------ */
/* 6. startup application received                                     */
/* ------------------------------------------------------------------ */

export function startupReceived(vars: {
  contactFirstName?: string;
  company: string;
}): Email {
  return {
    subject: "Got it.",
    text: `${greeting(vars.contactFirstName)}

${vars.company}'s application is in.

I read every startup application myself before it goes live, so this
is a queue of one person, not a review board. Expect an answer in a
few days.

If something changes before then — you close a round, the role
shifts, you need someone sooner — reply to this and it gets attached
to your file.

— Matthew
Founder, Axiom Pathways${footer({})}`,
  };
}
