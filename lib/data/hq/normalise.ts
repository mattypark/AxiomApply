import type { HqRow, HqStatus, Side } from "./types";

/**
 * Three tables in, one row shape out.
 *
 * Interns (`applications`), startups (`startup_inquiries`) and chapters
 * (`chapter_applications`) were built at different times with different
 * vocabularies. HQ counts and filters across all three, so everything that
 * a chart groups by gets folded here: status words, grades, and the two
 * fields people type by hand (city / chapter and school), where "bay area",
 * "SF" and "Bay Area" have to land in one bar or the chart lies.
 *
 * Pure and dependency-free, so the tests run under plain `node --test`.
 */

// Status -----------------------------------------------------------------------

/**
 * Database status → HQ status.
 *
 * `applied` means undecided. Whether anyone has read it is a separate fact:
 * a stamped `read_at` (the Mark read button) or a reviewer's name in the
 * Sheet's column X, which is how reading has always been recorded there.
 */
export function hqStatus(status: string | null | undefined, read: { readAt?: string | null; reviewer?: string | null }): HqStatus {
  switch ((status ?? "").trim().toLowerCase()) {
    case "accepted":
    case "approved":
      return "accepted";
    case "waitlist":
      return "waitlist";
    case "rejected":
      return "rejected";
    case "withdrawn":
      return "withdrawn";
    case "review":
      return "read";
    default:
      return read.readAt || read.reviewer?.trim() ? "read" : "new";
  }
}

// Free text --------------------------------------------------------------------

const squash = (raw: string) => raw.trim().replace(/\s+/g, " ");

/** Case, punctuation and spacing don't make two places different. */
export function foldKey(raw: string): string {
  return squash(raw)
    .toLowerCase()
    .replace(/[.,'’()]/g, "")
    .replace(/\s*[-–—/&]\s*/g, " ");
}

/**
 * The places people spell a dozen ways. Keys are `foldKey` output. Add to
 * this when HQ shows two bars for one place; anything not listed still gets
 * case- and spacing-folded by `foldLabels`.
 */
export const PLACE_ALIASES: Record<string, string> = {
  "bay area": "Bay Area",
  "sf": "Bay Area",
  "sf bay area": "Bay Area",
  "san francisco": "Bay Area",
  "san francisco bay area": "Bay Area",
  "silicon valley": "Bay Area",
  "online": "Online",
  "remote": "Online",
  "virtual": "Online",
  "online remote": "Online",
  "houston": "Houston",
  "houston tx": "Houston",
  "htx": "Houston",
  "nyc": "New York",
  "new york": "New York",
  "new york city": "New York",
  "ny": "New York",
  "la": "Los Angeles",
  "los angeles": "Los Angeles",
  "dallas": "Dallas",
  "dfw": "Dallas",
  "austin": "Austin",
  "austin tx": "Austin",
  "seattle": "Seattle",
};

export function canonicalPlace(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;
  return PLACE_ALIASES[foldKey(raw)] ?? squash(raw);
}

/**
 * Folds hand-typed labels that differ only by case, spacing or punctuation
 * into one display spelling: the most common one, ties broken
 * alphabetically so the choice is stable between polls.
 */
export function foldLabels(values: readonly (string | null)[]): Map<string, string> {
  const spellings = new Map<string, Map<string, number>>();
  for (const value of values) {
    if (!value) continue;
    const key = foldKey(value);
    const counts = spellings.get(key) ?? new Map<string, number>();
    counts.set(value, (counts.get(value) ?? 0) + 1);
    spellings.set(key, counts);
  }
  const display = new Map<string, string>();
  for (const counts of spellings.values()) {
    const best = [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0][0];
    for (const spelling of counts.keys()) display.set(spelling, best);
  }
  return display;
}

// Grade --------------------------------------------------------------------------

/**
 * One grade vocabulary. Interns pick from the contract ("11th grade",
 * "College — Junior"); chapters from their own list ("11th", "College
 * sophomore+"). Ordinal, so the chart keeps this order instead of ranking.
 */
export const GRADE_ORDER = [
  "9th grade",
  "10th grade",
  "11th grade",
  "12th grade",
  "Gap year",
  "College freshman",
  "College sophomore",
  "College sophomore+",
  "College junior",
  "College senior",
  "Other",
] as const;

export function canonicalGrade(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;
  const key = foldKey(raw);
  const school = key.match(/^(9|10|11|12)(th)?( grade)?$/);
  if (school) return `${school[1]}th grade`;
  if (key.includes("gap")) return "Gap year";
  if (key.includes("college") || key.includes("university")) {
    if (key.includes("sophomore+") || key.includes("sophomore or above")) return "College sophomore+";
    if (key.includes("freshman")) return "College freshman";
    if (key.includes("sophomore")) return "College sophomore";
    if (key.includes("junior")) return "College junior";
    if (key.includes("senior")) return "College senior";
  }
  return "Other";
}

// Interest -------------------------------------------------------------------------

/** The contract's own options (lib/apply-contract.ts, "Main interest"). */
export const INTERESTS = ["AI", "Computer Science", "Marketing", "Finance", "Startups", "Other"] as const;

export function canonicalInterest(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;
  const key = foldKey(raw);
  return INTERESTS.find((option) => option.toLowerCase() === key) ?? "Other";
}

// Rows -------------------------------------------------------------------------------

type Maybe = string | null | undefined;

/** The columns HQ reads from `applications`. The 0020 ones are absent on an older database. */
export type InternRecord = {
  id: string;
  name: Maybe;
  email: string;
  school: Maybe;
  grade: Maybe;
  interest: Maybe;
  chapter: Maybe;
  startup_role: Maybe;
  status: Maybe;
  reviewer: Maybe;
  submitted_at: string;
  decided_at: Maybe;
  sheet_row?: unknown;
  read_at?: Maybe;
  read_by?: Maybe;
  decided_via?: Maybe;
};

export type StartupRecord = {
  id: string;
  company: Maybe;
  name: Maybe;
  email: string;
  role_interest: Maybe;
  created_at: string;
  handled?: boolean | null;
  status?: Maybe;
  read_at?: Maybe;
  read_by?: Maybe;
  decided_at?: Maybe;
};

export type ChapterRecord = {
  id: string;
  name: Maybe;
  email: string;
  school: Maybe;
  grade: Maybe;
  city: Maybe;
  why_axiom: Maybe;
  status: Maybe;
  submitted_at: string;
  read_at?: Maybe;
  read_by?: Maybe;
  decided_at?: Maybe;
  decided_via?: Maybe;
};

const text = (value: Maybe) => (value?.trim() ? squash(value) : null);
const via = (value: Maybe) => (value === "sheet" || value === "hq" ? value : null);

/** The Sheet push stores `{ row: 123, … }`; older rows store the whole Sheet row. */
function sheetRowNumber(value: unknown): number | null {
  if (value && typeof value === "object" && "row" in value) {
    const row = Number((value as { row: unknown }).row);
    return Number.isInteger(row) && row > 1 ? row : null;
  }
  return null;
}

export function rowId(side: Side, id: string): string {
  return `${side}:${id}`;
}

export function parseRowId(value: string): { side: Side; id: string } | null {
  const match = value.match(/^(intern|startup|chapter):([0-9a-f-]{36})$/i);
  return match ? { side: match[1] as Side, id: match[2] } : null;
}

export function internRow(record: InternRecord): HqRow {
  const reviewer = text(record.read_by) ?? text(record.reviewer);
  const status = hqStatus(record.status, { readAt: record.read_at, reviewer });
  return {
    id: rowId("intern", record.id),
    side: "intern",
    name: text(record.name) ?? record.email,
    email: record.email.trim(),
    org: text(record.school),
    chapter: canonicalPlace(record.chapter),
    grade: canonicalGrade(record.grade),
    interest: canonicalInterest(record.interest),
    headline: text(record.startup_role) ?? "",
    status,
    submittedAt: record.submitted_at,
    readAt: record.read_at ?? null,
    reviewer,
    decidedAt: record.decided_at ?? null,
    decidedVia: via(record.decided_via),
    sheetRow: sheetRowNumber(record.sheet_row),
  };
}

export function startupRow(record: StartupRecord): HqRow {
  const reviewer = text(record.read_by);
  // Before 0020 there is no status column: `handled` was the only signal.
  const readAt = record.read_at ?? null;
  const status =
    record.status === undefined
      ? record.handled
        ? "read"
        : "new"
      : hqStatus(record.status, { readAt, reviewer });
  return {
    id: rowId("startup", record.id),
    side: "startup",
    name: text(record.name) ?? record.email,
    email: record.email.trim(),
    org: text(record.company),
    chapter: null,
    grade: null,
    interest: null,
    headline: text(record.role_interest) ?? "",
    status,
    submittedAt: record.created_at,
    readAt,
    reviewer,
    decidedAt: record.decided_at ?? null,
    decidedVia: record.decided_at ? "hq" : null,
    sheetRow: null,
  };
}

export function chapterRow(record: ChapterRecord): HqRow {
  const reviewer = text(record.read_by);
  const readAt = record.read_at ?? null;
  return {
    id: rowId("chapter", record.id),
    side: "chapter",
    name: text(record.name) ?? record.email,
    email: record.email.trim(),
    org: text(record.school),
    chapter: canonicalPlace(record.city),
    grade: canonicalGrade(record.grade),
    interest: null,
    headline: text(record.why_axiom) ?? "",
    status: hqStatus(record.status, { readAt, reviewer }),
    submittedAt: record.submitted_at,
    readAt,
    reviewer,
    decidedAt: record.decided_at ?? null,
    decidedVia: via(record.decided_via),
    sheetRow: null,
  };
}

/** Folds school and chapter spellings across the whole set, after the aliases have run. */
export function foldRows(rows: readonly HqRow[]): HqRow[] {
  const orgs = foldLabels(rows.map((row) => row.org));
  const chapters = foldLabels(rows.map((row) => row.chapter));
  return rows.map((row) => ({
    ...row,
    org: row.org ? (orgs.get(row.org) ?? row.org) : null,
    chapter: row.chapter ? (chapters.get(row.chapter) ?? row.chapter) : null,
  }));
}

/**
 * Database words for an HQ decision, per table, or null when that table has
 * no word for it. Chapters say "approved" and have no waitlist at all
 * (0017_chapters.sql), so a chapter can only be approved or turned down.
 */
export function dbStatusFor(side: Side, decision: "accepted" | "waitlist" | "rejected"): string | null {
  if (side !== "chapter") return decision;
  if (decision === "accepted") return "approved";
  return decision === "rejected" ? "rejected" : null;
}

/** The decision buttons a side gets. */
export function decisionsFor(side: Side): ("accepted" | "waitlist" | "rejected")[] {
  return side === "chapter" ? ["accepted", "rejected"] : ["accepted", "waitlist", "rejected"];
}
