/**
 * The two emails, kept in the same voice as the site's own copy
 * (lib/email/templates.ts). Rules that must survive editing:
 *
 *   · plain text, left aligned, one column — renders identically everywhere
 *   · "First —", never "Dear". A fallback greeting when the name is missing
 *   · verdict first. No "we are thrilled", "unfortunately", "we regret"
 *   · no exclamation points, no emoji, no résumé-culture language
 *   · never from noreply@ — every one of these is replyable, and says so
 */

function greeting_(firstName) {
  var name = String(firstName || "").trim().split(/\s+/)[0];
  return name ? name + " —" : "Hey there,";
}

function footer_() {
  return "\n\n--\nAxiom Pathways · " + POSTAL + "\n";
}

/** Rejected. Says no, once, in the first line. */
function notSelectedEmail_(firstName) {
  return {
    subject: "Not this cycle.",
    text:
      greeting_(firstName) +
      `

We're not matching you this cycle. That's a real no, not a soft
one, and I'd rather say it plainly than leave you checking your
inbox for three weeks.

The part that matters: this is almost never about you not being
good enough. This round we had ${CYCLE.applicantCount} applications
and ${CYCLE.matchCount} seats. Most of the no's came down to one of
three things.

  No link. We couldn't see anything you'd shipped — only
  descriptions of it. This is the big one.

  Timing. You wanted ${CYCLE.season}, and the roles that opened
  weren't in your field.

  Too broad. "Anything at a startup" reads as no strong pull
  toward anything in particular.

You keep everything except the match:

  The feed stays open. Thousands of listings, refreshed daily.
  People get placed off the feed every week with zero help from
  us, and that counts exactly as much as anything we hand-match.
  → ${SITE}/internships

  Learn stays open. Finish a track and it shows on your file next
  time.
  → ${SITE}/learn

  You can reapply. Applications reopen ${CYCLE.nextCycleDate}.
  There's no cap on attempts and reapplying is not held against
  you — a real chunk of our current interns are second-round.

If you do one thing between now and then, do this: ship one thing
and put it on the internet. Public URL. A tool, a site, a bot, a
newsletter with actual readers. It does not have to be impressive.
It has to exist and be reachable by someone who isn't you. That
single change moves more applications from no to yes than
everything else combined.

Reply to this if you want. I read them.

— Matthew
Founder, Axiom Pathways` +
      footer_(),
  };
}

/**
 * Waitlisted, and everyone nobody has decided on yet.
 *
 * Written against the soft-no: copy that sounds encouraging, promises a date
 * nobody controls, and leaves someone refreshing their inbox for a month. So
 * it says what a waitlist actually is, refuses to name a date, and points at
 * the two things that stay open regardless of us.
 */
function waitlistedEmail_(firstName) {
  return {
    subject: "You're on the waitlist.",
    text:
      greeting_(firstName) +
      `

You're on the waitlist. Not a no, not a yes: we read your
application, we'd work with you, and there is no seat to hand you
right now.

What that's worth, plainly. We had ${CYCLE.applicantCount} applications
this round against a much smaller number of open roles. The
waitlist is where someone sits when the only missing piece is a
startup asking for what they do. When one asks, we come here
first — nobody has to reapply to be considered.

What I won't do is give you a date. It depends on startups I don't
control, and a made-up timeline is worse than none.

So don't wait on us:

  The feed stays open. Thousands of listings, refreshed daily, and
  people get placed off it every week with no help from us. That
  counts exactly as much as anything we hand-match.
  → ${SITE}/internships

  Learn stays open. Finish a track and it shows on your file the
  next time your name comes up.
  → ${SITE}/learn

The thing that moves people off this list is one public link. A
tool, a site, a bot, a newsletter someone actually reads. It does
not have to be impressive — it has to exist and be reachable by
someone who isn't you. When you have one, reply with it and I'll
put it on your file myself.

Reply if anything changes: new project, new deadline, a field
you've moved into. I read them.

— Matthew
Founder, Axiom Pathways` +
      footer_(),
  };
}

/** Dispatch by template name. Unknown names throw rather than send nothing. */
function renderEmail_(template, firstName) {
  if (template === "notSelected") return notSelectedEmail_(firstName);
  if (template === "waitlisted") return waitlistedEmail_(firstName);
  throw new Error("No copy for template: " + template);
}
