/**
 * Axiom decision mailer — configuration.
 *
 * A standalone sender that lives entirely in the Sheet: it reads the decision
 * column, renders the copy, and calls Resend directly. No website, no
 * database, no deploy. The other path (Axiom → Push decisions to site) still
 * exists and is unaffected; use one or the other for a given batch, never
 * both, or people receive two emails.
 *
 * What this path gives up, stated plainly so it is a choice and not a
 * surprise:
 *   · no suppression list — a hard-bounced address stays in the Sheet and
 *     gets mailed again next cycle unless you remove it by hand
 *   · no unsubscribe handling beyond replies
 *   · double-send protection is a column in this Sheet rather than a database
 *     constraint. Clearing that column, or deleting rows, re-arms a send.
 *
 * Everything you are likely to change lives in this file.
 */

/** Tab holding applications. */
var TAB = "Applications";

/**
 * Column positions, 1-indexed, read by POSITION and not by header text.
 *
 * The header row drifted out of sync with the data long ago: row 1 labels
 * column J "Status" while J holds essay text, and the real decision chip sits
 * in Y with no header at all. Do not repair the header row, and do not insert
 * or reorder columns — adding to the RIGHT of the last one is safe, anything
 * else moves these and the mailer starts reading the wrong cells.
 */
var COL = {
  timestamp: 1, // A
  name: 2, // B
  email: 3, // C
  reviewer: 24, // X — Matthew, Frank
  decision: 25, // Y — Accepted / Rejected / waitlist, blank = undecided
  category: 26, // Z — SWE / GTM / Data / Hardware / Other
};

/** Tabs whose name contains this list people already written to by hand. */
var SENT_MARKER = "sent out";

/**
 * Written back to the Applications tab so nobody is mailed twice. Created to
 * the right of the last column on first run. These are the ONLY cells this
 * script writes into the Applications tab.
 */
var MARK_HEADER = "Emailed";
var MARK_AT_HEADER = "Emailed At";

/** Where the dry run writes what it would have sent. Wiped on each preview. */
var PREVIEW_TAB = "email preview";

/**
 * Recipients per run.
 *
 * Resend's free plan allows 100 emails a day and 3,000 a month, so 90 leaves
 * headroom for the site's own transactional mail on the same key. Raising
 * this past your plan's daily cap does not send faster — it fails the
 * remainder with a 429, and those rows stay unmarked for the next run.
 *
 * Even on a paid plan, spreading ~660 emails over several days is the right
 * move: a domain with no sending history that suddenly emits 600 messages is
 * the classic spam-filter trigger.
 */
var BATCH_SIZE = 90;

/**
 * Sender. The domain must be Verified in Resend, spelled EXACTLY — a
 * subdomain is a separate domain there, so tx.axiomapply.com is not covered
 * by axiomapply.com being verified.
 *
 * The From address does not need to be a real mailbox. Nothing is delivered
 * to it; replies follow REPLY_TO.
 */
var FROM = "Matthew Park <matthew@axiomapply.com>";
var REPLY_TO = ["matthew@axiompathways.org", "frank@axiompathways.org"];

/** CAN-SPAM requires a real postal address. Never a home address. */
var POSTAL = "Axiom Pathways, PO Box 1234, Houston, TX 77002";

var SITE = "https://www.axiomapply.com";

/**
 * Numbers and dates that appear WORD FOR WORD in the copy. Set them once per
 * cycle, before previewing. They are claims applicants compare with each
 * other, so they should be true.
 */
var CYCLE = {
  applicantCount: "659",
  matchCount: "24",
  season: "summer",
  nextCycleDate: "January 5",
};

/**
 * Decision values this script understands, lowercased.
 *
 * Anything else — POOL, a stray timestamp, a typo — skips that person
 * entirely rather than being guessed at. A wrong guess here sends someone the
 * wrong verdict, which cannot be taken back.
 */
var DECISIONS = {
  rejected: "rejected",
  accepted: "accepted",
  waitlist: "waitlist",
  waitlisted: "waitlist",
  withdrawn: "withdrawn",
};

/** Which decision gets which email. Anything absent here is never mailed. */
var TEMPLATE_FOR = {
  rejected: "notSelected",
  waitlist: "waitlisted",
  undecided: "waitlisted",
  // accepted and withdrawn are deliberately absent. The acceptance email
  // needs the startup, role, founder and an accept link, none of which this
  // Sheet carries — those are written by hand.
};
