import type { Side } from "@/lib/apply-sides";

/**
 * Everything the after-submit prototype shows. All of it is invented: the
 * names say "Test", the emails are @example.com, the phone numbers are 555,
 * and the startups are "Example" companies. Nothing here is read from, or
 * shaped after, a real applicant.
 *
 * Dates are plain YYYY-MM-DD strings against a fixed "today" so the server
 * and the browser render the same text (no timezone or clock in the loop).
 */

export const TODAY = "2026-09-28";

/** Where an application stands. `decided` carries the outcome separately. */
export type Stage = "received" | "read" | "decided";
export type Outcome = "accepted" | "waitlist" | "rejected" | "withdrawn";

/**
 * How an answer behaves after submit — the proposal in
 * docs/DESIGN-AFTER-SUBMIT.md, "What can change":
 * open = always editable, until-read = editable until a person has read it,
 * locked = identity or the join key, never edited in place.
 */
export type Lock = "open" | "until-read" | "locked";

export type Answer = { key: string; label: string; value: string; lock: Lock };
export type Edit = { at: string; field: string; from: string; to: string };

export type MockApplication = {
  id: string;
  side: Side;
  name: string;
  email: string;
  phone: string;
  /** School for interns and chapters; the company for startups. */
  org: string;
  chapter: string;
  /** Contract grade string; null for startups. */
  grade: string | null;
  /** Contract "Main interest"; interns only. */
  interest: string | null;
  headline: string;
  submittedAt: string;
  readAt: string | null;
  reviewer: string | null;
  outcome: Outcome | null;
  decidedAt: string | null;
  sheetRow: number;
  edits: Edit[];
};

const SCHOOLS = [
  "Example High School",
  "Sample Prep Academy",
  "Demo Charter School",
  "Placeholder University",
  "Test Valley High",
];
const COMPANIES = ["Example Labs", "Sample Robotics", "Demo Health Co.", "Test Ledger", "Placeholder AI"];
const CHAPTERS = ["Bay Area", "Online", "Houston", "Seattle", "New York"];
const REVIEWERS = ["Matthew", "Frank"];
const INTERN_ROLES = [
  "AI engineer at an early-stage startup",
  "Growth marketing, anything consumer",
  "Backend work on a real product",
  "Design + front end",
  "Finance / ops at a seed-stage team",
];
const STARTUP_ASKS = ["Two AI interns, remote", "One growth intern", "A front-end intern for the fall"];
const CHAPTER_PITCHES = ["A chapter of 30 at my school", "Start with the robotics club", "Online chapter for my district"];

/** Day offset from TODAY, as YYYY-MM-DD. Only ever counts back within 2026. */
export function daysAgo(days: number): string {
  const base = Date.UTC(2026, 8, 28);
  return new Date(base - days * 86_400_000).toISOString().slice(0, 10);
}

/** Seeded PRNG (mulberry32) — the same "random" spread on every render. */
function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
/** The contract's own grade and interest options (lib/apply-contract.ts). */
const GRADES = ["9th grade", "10th grade", "11th grade", "12th grade", "College — Freshman", "College — Sophomore"];
const INTERESTS = ["AI", "Computer Science", "Marketing", "Finance", "Startups", "Other"];
/** Weighted so the charts have a shape: AI-heavy, Bay Area-heavy, juniors-heavy. */
const INTEREST_WEIGHT = [0.34, 0.24, 0.15, 0.1, 0.12, 0.05];
const CHAPTER_WEIGHT = [0.36, 0.26, 0.16, 0.12, 0.1];
const GRADE_WEIGHT = [0.08, 0.16, 0.34, 0.26, 0.1, 0.06];
const OUTCOMES: Outcome[] = ["accepted", "waitlist", "rejected", "rejected", "waitlist", "withdrawn"];

function weighted<T>(values: readonly T[], weights: readonly number[], roll: number): T {
  let sum = 0;
  for (let i = 0; i < values.length; i += 1) {
    sum += weights[i];
    if (roll < sum) return values[i];
  }
  return values[values.length - 1];
}

/**
 * 60 days of made-up traffic: mostly interns, some startups and chapters,
 * busier lately (a launch bump two weeks ago), older rows more often read
 * and decided, a handful edited after submit.
 */
function build(): MockApplication[] {
  const rand = seeded(20260928);
  const rows: MockApplication[] = [];
  for (let age = 59; age >= 0; age -= 1) {
    const bump = age >= 12 && age <= 16 ? 5 : 0;
    const perDay = Math.round(1 + rand() * 3 + (60 - age) / 22 + bump);
    for (let n = 0; n < perDay; n += 1) {
      const index = rows.length;
      const tag = String(index + 1).padStart(3, "0");
      const sideRoll = rand();
      const side: Side = sideRoll < 0.78 ? "intern" : sideRoll < 0.9 ? "startup" : "chapter";
      const readAfter = age > 1 && rand() < Math.min(0.95, age / 9) ? Math.min(age - 1, 1 + Math.floor(rand() * 5)) : null;
      const decided = readAfter !== null && age > 14 && rand() < 0.8;
      const letter = LETTERS[index % 26];
      rows.push({
        id: `mock-${tag}`,
        side,
        name:
          side === "startup" ? `Demo Founder ${letter}${index}` : side === "chapter" ? `Sample Lead ${letter}${index}` : `Test Applicant ${letter}${index}`,
        email: `test+${tag}@example.com`,
        phone: `(555) 010-${tag.padStart(4, "0")}`,
        org: side === "startup" ? COMPANIES[index % COMPANIES.length] : SCHOOLS[Math.floor(rand() * SCHOOLS.length)],
        chapter: weighted(CHAPTERS, CHAPTER_WEIGHT, rand()),
        grade: side === "startup" ? null : weighted(GRADES, GRADE_WEIGHT, rand()),
        interest: side === "intern" ? weighted(INTERESTS, INTEREST_WEIGHT, rand()) : null,
        headline:
          side === "startup"
            ? STARTUP_ASKS[index % STARTUP_ASKS.length]
            : side === "chapter"
              ? CHAPTER_PITCHES[index % CHAPTER_PITCHES.length]
              : INTERN_ROLES[index % INTERN_ROLES.length],
        submittedAt: daysAgo(age),
        readAt: readAfter === null ? null : daysAgo(age - readAfter),
        reviewer: readAfter === null ? null : REVIEWERS[index % 2],
        outcome: decided ? OUTCOMES[Math.floor(rand() * OUTCOMES.length)] : null,
        decidedAt: decided ? daysAgo(Math.max(0, age - 10 - Math.floor(rand() * 4))) : null,
        sheetRow: 640 + index,
        edits: rand() < 0.08 ? [{ at: daysAgo(Math.max(0, age - 1)), field: "GitHub", from: "", to: `@test-${tag}` }] : [],
      });
    }
  }
  // Newest first, the way the list reads.
  return rows.reverse();
}

export const MOCK_APPLICATIONS: readonly MockApplication[] = build();

export const MOCK_CHAPTERS = CHAPTERS;
export const MOCK_SCHOOLS = SCHOOLS;
export const MOCK_GRADES = GRADES;
export const MOCK_INTERESTS = INTERESTS;

/** The signed-in viewer's own application, one per side. */
export const MY_ANSWERS: Record<Side, Answer[]> = {
  intern: [
    { key: "name", label: "Full name", value: "Test Applicant", lock: "locked" },
    { key: "email", label: "Email", value: "test@example.com", lock: "locked" },
    { key: "phone", label: "Phone", value: "(555) 010-0100", lock: "open" },
    { key: "school", label: "School", value: "Example High School", lock: "locked" },
    { key: "grade", label: "Grade / Year", value: "11th grade", lock: "locked" },
    { key: "interest", label: "Main interest", value: "AI", lock: "until-read" },
    { key: "chapter", label: "City / Chapter", value: "Bay Area", lock: "until-read" },
    {
      key: "startup_role",
      label: "What internship are you looking for?",
      value: "AI engineer at an early-stage startup.",
      lock: "until-read",
    },
    {
      key: "background",
      label: "Why that, and what's your background?",
      value: "I built a study-planner bot that 40 classmates use every week.",
      lock: "until-read",
    },
    { key: "github", label: "GitHub", value: "@test-applicant", lock: "open" },
    { key: "linkedin", label: "LinkedIn", value: "", lock: "open" },
    { key: "resume", label: "Resume / CV", value: "resume-test.pdf", lock: "open" },
  ],
  startup: [
    { key: "company", label: "Startup name", value: "Example Labs", lock: "locked" },
    { key: "email", label: "Email", value: "founder@example.com", lock: "locked" },
    { key: "website", label: "Website", value: "example.com", lock: "open" },
    { key: "pitch", label: "What are you building?", value: "Tools that help small clinics schedule.", lock: "until-read" },
    { key: "stage", label: "Stage", value: "Pre-seed", lock: "open" },
    { key: "needs", label: "What are you looking for specifically?", value: "Two AI interns, remote.", lock: "open" },
    { key: "hours", label: "Hours per week", value: "10–20", lock: "open" },
    { key: "minors", label: "Are you able to work with interns under 18?", value: "Yes", lock: "until-read" },
  ],
  chapter: [
    { key: "name", label: "Full name", value: "Sample Lead", lock: "locked" },
    { key: "email", label: "Email", value: "lead@example.com", lock: "locked" },
    { key: "school", label: "School name", value: "Demo Charter School", lock: "locked" },
    { key: "size", label: "Roughly how many students?", value: "500–1,000", lock: "until-read" },
    { key: "plan", label: "Your first month", value: "Kick-off at the robotics club, then a demo day.", lock: "until-read" },
    { key: "linkedin", label: "LinkedIn", value: "", lock: "open" },
  ],
};

/** A made-up match for the accepted intern — the startup is fictional. */
export const MOCK_MATCH = {
  startup: "Example Labs",
  role: "AI engineering intern",
  founder: "Demo Founder",
  start: "October 12",
};
