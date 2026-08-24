/**
 * Roles at Axiom Pathways itself.
 *
 * Deliberately separate from lib/apply-contract.ts and lib/apply-sides.ts.
 * Those describe someone applying THROUGH Axiom — into a partner startup, a
 * chapter, or as a startup posting a role. This file is the other direction:
 * joining the team that runs the thing.
 *
 * Content, not code. Editing an entry here is the whole job of opening or
 * closing a position — the index page, the role page, the sitemap, and the
 * application form all read from this array.
 *
 * `open: false` keeps a role's page reachable (a link already sent out still
 * resolves) while dropping it out of the open-positions grid.
 */

export type CareerRole = {
  slug: string;
  title: string;
  /** Which side of the org this sits on — shown as the card's second line. */
  team: string;
  /** Hours, not salary. A nonprofit run by students has no comp band to quote. */
  commitment: string;
  location: string;
  /** One sentence on the card; the hook. */
  summary: string;
  /** The opening paragraph of the role page. */
  intro: string;
  whatYouDo: readonly string[];
  whoFits: readonly string[];
  /** The concrete thing waiting on day one. Vague roles attract vague people. */
  firstProject: string;
  open: boolean;
};

export const CAREER_ROLES: readonly CareerRole[] = [
  {
    slug: "founding-engineer",
    title: "Founding Engineer",
    team: "Engineering",
    commitment: "Volunteer · 8–12 hrs/week",
    location: "Remote",
    summary:
      "Own the platform every applicant, chapter, and partner startup runs on.",
    intro:
      "This site, the application pipeline, the intern workspace, and the chapter HQ are one Next.js codebase with one person on it. You would be the second — and from week one you own surfaces outright rather than picking up tickets.",
    whatYouDo: [
      "Ship user-facing features end to end: Next.js, React, TypeScript, Supabase.",
      "Keep the application pipeline honest — every submission lands, every applicant hears back.",
      "Build the internal tooling the ops side is currently doing by hand in a spreadsheet.",
      "Review the other person's code, and expect the same back.",
    ],
    whoFits: [
      "You have shipped something real that other people used. Link it.",
      "You are comfortable owning a surface with no one to hand it off to.",
      "You would rather cut scope than ship something half-working.",
      "High school or early college. Credentials are not the filter here — the work is.",
    ],
    firstProject:
      "Applicant status emails: one queue, one template set, no applicant left wondering for three weeks.",
    open: true,
  },
  {
    slug: "chapter-lead",
    title: "Chapter Lead",
    team: "Chapters",
    commitment: "Volunteer · 4–6 hrs/week",
    location: "Your school",
    summary:
      "Start Axiom at your school and run it — recruiting, sessions, placements.",
    intro:
      "A chapter is the ground game. You find the people at your school who are already building things on their own, run the curriculum with them, and get the strongest ones in front of our partner startups.",
    whatYouDo: [
      "Recruit a founding cohort — the builders, not the resume collectors.",
      "Run the AI, CS, and marketing curriculum on a schedule you set.",
      "Put your strongest members in front of partner startups, and vouch for them.",
      "Report back what is working so the next chapter does not relearn it.",
    ],
    whoFits: [
      "You are currently at the school you would be starting the chapter at.",
      "You can hold a room of your peers for an hour without a slide deck.",
      "You follow up. Chapters die of unanswered messages, not bad ideas.",
      "You already know five people at your school worth recruiting.",
    ],
    firstProject:
      "Your founding cohort: ten members, first session on the calendar, inside six weeks.",
    open: true,
  },
  {
    slug: "partnerships-lead",
    title: "Startup Partnerships Lead",
    team: "Partnerships",
    commitment: "Volunteer · 5–8 hrs/week",
    location: "Remote",
    summary:
      "Bring in the startups our interns drop into — and keep them coming back.",
    intro:
      "Every placement starts with a founder saying yes. You are the person who gets that yes, scopes the role so it is real work rather than busywork, and makes sure the founder comes back next cohort.",
    whatYouDo: [
      "Source and pitch early-stage startups — cold outreach included, and mostly.",
      "Scope roles with founders so an intern ships something in week one.",
      "Check in mid-placement, before a quiet problem becomes a dead partnership.",
      "Keep the partner list current so nobody applies to a role that closed.",
    ],
    whoFits: [
      "You can write a cold email a founder actually answers.",
      "You are unbothered by a 90% no rate.",
      "You can tell a real role from a coffee-fetching one, and push back on the second.",
    ],
    firstProject:
      "Five new partner startups with scoped roles, ready for the next cohort.",
    open: true,
  },
  {
    slug: "curriculum-designer",
    title: "Curriculum Designer",
    team: "Curriculum · AI & CS",
    commitment: "Volunteer · 4–6 hrs/week",
    location: "Remote",
    summary:
      "Write the AI and CS material every chapter runs — built around shipping, not lecturing.",
    intro:
      "Our curriculum has one job: get a student from curious to shipping fast enough that a founder would hire them. You write it, test it against a real chapter, and cut whatever does not survive contact.",
    whatYouDo: [
      "Write and maintain the AI and CS modules chapters run week to week.",
      "Build the projects — every module ends in something a student can show.",
      "Sit in on chapter sessions and rewrite whatever lost the room.",
      "Keep the material current. AI tooling moves faster than any syllabus.",
    ],
    whoFits: [
      "You know the material well enough to teach it without a script.",
      "You write clearly for people who are two years behind you, without talking down.",
      "You would rather cut a module than pad it.",
    ],
    firstProject:
      "Rebuild the AI track around agents and evals — six weeks, six shipped projects.",
    open: true,
  },
  {
    slug: "brand-content-lead",
    title: "Brand & Content Lead",
    team: "Brand",
    commitment: "Volunteer · 5–8 hrs/week",
    location: "Remote",
    summary:
      "Own how Axiom looks and sounds everywhere it shows up.",
    intro:
      "Most students find us through a post, not a search. You decide what those posts are, make them, and keep the whole surface — site copy, socials, decks — sounding like one organisation.",
    whatYouDo: [
      "Run the Instagram and LinkedIn accounts — plan, make, post, read the numbers.",
      "Cut short video from placements and chapter sessions.",
      "Keep the site copy, decks, and outreach templates in one voice.",
      "Turn intern outcomes into stories that make the next cohort apply.",
    ],
    whoFits: [
      "You have grown an account, or made something that traveled. Show it.",
      "You can shoot and cut on a phone without waiting on a production budget.",
      "You have taste and can defend it.",
    ],
    firstProject:
      "A placement-story series: one intern, one shipped thing, one post a week.",
    open: true,
  },
  {
    slug: "operations",
    title: "Operations",
    team: "Operations",
    commitment: "Volunteer · 4–6 hrs/week",
    location: "Remote",
    summary:
      "Keep the applicant pipeline moving and nothing falling through it.",
    intro:
      "Hundreds of applications arrive per cohort. Operations is the reason each one gets read, sorted, answered, and matched — and the reason nobody waits a month for a no.",
    whatYouDo: [
      "Read and triage incoming applications against the rubric.",
      "Run decisions to a schedule so response times stay in days, not weeks.",
      "Match accepted interns to partner roles with the partnerships lead.",
      "Flag whatever the process keeps breaking on, and fix it.",
    ],
    whoFits: [
      "You are organised in a way other people can see from the outside.",
      "You do not let a thread go two days without an answer.",
      "You are comfortable telling someone no, kindly and quickly.",
    ],
    firstProject:
      "Get the current cohort's median response time under five days.",
    open: true,
  },
] as const;

export function getRole(slug: string): CareerRole | undefined {
  return CAREER_ROLES.find((role) => role.slug === slug);
}

export const OPEN_ROLES = CAREER_ROLES.filter((role) => role.open);

/** What happens after you hit send. Stated plainly so nobody has to ask. */
export const CAREER_PROCESS = [
  "One call with a founder — 30 minutes, no whiteboard.",
  "A two-week trial on real work, the same work the role does.",
  "Then you are on the team, with a surface of your own.",
] as const;

/** Where an unlisted role goes. Real inbox — axiompathways.org carries the mail. */
export const CAREERS_EMAIL = "matthew@axiompathways.org";
