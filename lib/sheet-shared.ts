import type { ApplicationStatus } from "./applications";

/**
 * The interns Sheet, as data: where each answer sits, what column Y may say,
 * what a timestamp means, and the rule for when a Sheet push may overwrite a
 * decision made in HQ.
 *
 * Shared by the "Push decisions to site" route (/api/sheet/decisions) and the
 * one-time CSV backfill (scripts/backfill-applications.ts). Pure and free of
 * `server-only`, so both Next and plain Node can load it.
 */

// Columns ------------------------------------------------------------------------

/**
 * 0-based positions in the `Applications` tab, in the order the website's
 * webhook appends them (APPS_SCRIPT_WEBHOOK.gs → appendRow). Positions, not
 * headers: the header row drifted long ago (row 1 calls J "Status", but J
 * holds the role answer and the real decision chip is Y, which has no header).
 * G ("Track") and L (the literal "Applied") carry nothing to import.
 */
export const SHEET_COL = {
  timestamp: 0, // A
  name: 1, // B
  email: 2, // C
  phone: 3, // D
  school: 4, // E
  grade: 5, // F
  interest: 7, // H
  chapter: 8, // I
  startup_role: 9, // J
  background: 10, // K
  appliedMarker: 11, // L
  letter: 12, // M
  instagram: 13, // N
  linkedin: 14, // O
  github: 15, // P
  other_link: 16, // Q
  resume_url: 17, // R
  comments: 18, // S
  extra_file_url: 19, // T
  reviewer: 23, // X
  decision: 24, // Y
  category: 25, // Z
} as const;

/** The answers the Sheet holds, by `applications` column name. */
export const ANSWER_COLUMNS = [
  "phone",
  "school",
  "grade",
  "interest",
  "chapter",
  "startup_role",
  "background",
  "letter",
  "instagram",
  "linkedin",
  "github",
  "other_link",
  "resume_url",
  "comments",
  "extra_file_url",
] as const;

export type AnswerColumn = (typeof ANSWER_COLUMNS)[number];
export type Answers = Partial<Record<AnswerColumn, string>>;

/** Longest answer we'll store from the Sheet; anything longer is a paste accident. */
const MAX_ANSWER = 10_000;

/** Answers from untrusted input (a CSV cell, an Apps Script payload): strings only, trimmed, bounded. */
export function cleanAnswers(raw: unknown): Answers {
  const answers: Answers = {};
  if (!raw || typeof raw !== "object") return answers;
  for (const column of ANSWER_COLUMNS) {
    const value = (raw as Record<string, unknown>)[column];
    if (typeof value === "string" && value.trim()) answers[column] = value.trim().slice(0, MAX_ANSWER);
  }
  return answers;
}

/**
 * The answers worth writing onto an existing row: only where the row has
 * nothing. The Sheet never overwrites something the database already holds,
 * so running a backfill twice, or after an applicant edit, changes nothing.
 */
export function fillNulls(existing: Record<string, unknown>, incoming: Answers): Answers {
  const fields: Answers = {};
  for (const column of ANSWER_COLUMNS) {
    const have = existing[column];
    const value = incoming[column];
    if (value && (have === null || have === undefined || (typeof have === "string" && !have.trim()))) fields[column] = value;
  }
  return fields;
}

// Column Y -------------------------------------------------------------------------

/** What column Y is allowed to say. Compared case-insensitively, trimmed. */
export const DECISION_WORDS: Record<string, ApplicationStatus> = {
  accepted: "accepted",
  rejected: "rejected",
  waitlist: "waitlist",
  waitlisted: "waitlist",
  withdrawn: "withdrawn",
};

export function parseDecision(
  raw: string | undefined | null,
): { ok: true; status: ApplicationStatus; undecided: boolean } | { ok: false } {
  const value = (raw ?? "").trim();
  if (!value) return { ok: true, status: "applied", undecided: true };
  const mapped = DECISION_WORDS[value.toLowerCase()];
  if (!mapped) return { ok: false };
  return { ok: true, status: mapped, undecided: false };
}

/** Column Y, as compared between pushes: trimmed and lowercased, blank = "". */
export function yKey(raw: string | null | undefined): string {
  return (raw ?? "").trim().toLowerCase();
}

// Timestamps ------------------------------------------------------------------------

/** The Sheet's own time zone (File → Settings). Its timestamps are wall-clock times there. */
export const SHEET_TIME_ZONE = "America/Chicago";

function zoneOffsetMs(utcMs: number, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(utcMs));
  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  return Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second")) - utcMs;
}

/**
 * "9/14/2026 13:22:05" (the Sheet's display format, US order) as an ISO
 * instant, read as wall-clock time in `timeZone`. Anything else that Date
 * understands is accepted as-is; anything it doesn't is null.
 */
export function parseSheetTime(raw: string | null | undefined, timeZone = SHEET_TIME_ZONE): string | null {
  const text = (raw ?? "").trim();
  if (!text) return null;
  const match = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[ ,T]+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (!match) {
    const ms = Date.parse(text);
    return Number.isNaN(ms) ? null : new Date(ms).toISOString();
  }
  const [, month, day, year, hour = "0", minute = "0", second = "0"] = match;
  const wall = Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second));
  // Two passes settle the offset across a daylight-saving change.
  let utc = wall - zoneOffsetMs(wall, timeZone);
  utc = wall - zoneOffsetMs(utc, timeZone);
  return new Date(utc).toISOString();
}

// Decisions made in both places ------------------------------------------------------

export type ExistingDecision = {
  status: string;
  contacted: boolean;
  /** Absent on a database older than 0020_hq.sql. */
  decidedVia?: "sheet" | "hq" | null;
  sheetDecision?: string | null;
};

export type IncomingDecision = {
  status: ApplicationStatus;
  undecided: boolean;
  contacted: boolean;
  /** Column Y exactly as the Sheet shows it. */
  decision: string;
};

export type DecisionPlan =
  | { kind: "skip" }
  /** HQ's decision stands; only what the Sheet now says (and the contacted flag) is recorded. */
  | { kind: "record" }
  /** The Sheet's decision is applied. */
  | { kind: "apply" };

/**
 * When may a Sheet push change a row's status?
 *
 * Decisions can be made in HQ or in column Y. Neither place knows when the
 * other last changed, so every push records what Y said (`sheet_decision`),
 * and the rule is: the most recent change wins.
 *
 *   · Decided in the Sheet (or never decided): the Sheet applies, as always.
 *   · Decided in HQ, and Y reads the same as on the last push (or this is
 *     the first push to see it): Y hasn't moved since, so HQ's decision is
 *     the newer one. It stands; Y is recorded.
 *   · Decided in HQ, and Y has changed since the last push: someone changed
 *     it in the Sheet after HQ decided. The Sheet applies.
 */
export function planDecision(existing: ExistingDecision, incoming: IncomingDecision): DecisionPlan {
  const y = yKey(incoming.decision);
  const trackingY = existing.sheetDecision !== undefined;

  if (existing.decidedVia === "hq") {
    const unchanged = existing.sheetDecision === null || existing.sheetDecision === undefined || yKey(existing.sheetDecision) === y;
    if (unchanged) {
      const nothingNew = trackingY && existing.sheetDecision !== null && existing.contacted === incoming.contacted;
      return nothingNew ? { kind: "skip" } : { kind: "record" };
    }
    return { kind: "apply" };
  }

  const sameStatus = existing.status === incoming.status && existing.contacted === incoming.contacted;
  const sameY = !trackingY || yKey(existing.sheetDecision) === y;
  return sameStatus && sameY ? { kind: "skip" } : { kind: "apply" };
}
