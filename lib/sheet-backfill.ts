import {
  SHEET_COL,
  SHEET_TIME_ZONE,
  cleanAnswers,
  fillNulls,
  parseDecision,
  parseSheetTime,
  type Answers,
} from "./sheet-shared.ts";
import type { ApplicationStatus } from "./applications";

/**
 * Sheet → `applications`, the one-time backfill.
 *
 * Web inserts into `applications` failed silently until 0017, and the Sheet
 * push only ever sent name, email and decision, so the database is missing
 * most applicants' answers. This reads a CSV export of the interns Sheet's
 * `Applications` tab and works out, without writing anything, what the
 * database needs: blank answers filled on rows it has, and rows it never got.
 *
 * Pure: the script (scripts/backfill-applications.ts) does the I/O and the
 * writing, and only when asked.
 */

// CSV ----------------------------------------------------------------------------------

/** RFC 4180: quoted fields, doubled quotes, newlines inside quotes, CRLF or LF. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  const input = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    if (quoted) {
      if (char === '"' && input[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && input[i + 1] === "\n") i += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

// Reading the Sheet -------------------------------------------------------------------------

export type SheetApplication = {
  /** Real Sheet row number (header = 1), so any row is findable by eye. */
  row: number;
  email: string;
  name: string | null;
  submittedAt: string | null;
  answers: Answers;
  reviewer: string | null;
  category: string | null;
  status: ApplicationStatus;
  undecided: boolean;
  /** Column Y as displayed. */
  decision: string;
};

export type Skip = { row: number; why: string };

/**
 * Percentages only, never values: whether each column holds what its
 * position says it should. A column that moved shows up here as a number far
 * from 100 before anything is written.
 */
export type ShapeReport = {
  dataRows: number;
  emailInC: number;
  timestampInA: number;
  appliedInL: number;
  gradeLikeInF: number;
  decisionReadableInY: number;
};

const pct = (count: number, of: number) => (of ? Math.round((count / of) * 100) : 0);
const cell = (row: string[], index: number) => (row[index] ?? "").trim();
const GRADE_LIKE = /(\d{1,2}(st|nd|rd|th)?\b|grade|college|freshman|sophomore|junior|senior|gap|other)/i;

export function readSheet(
  table: string[][],
  timeZone = SHEET_TIME_ZONE,
): { applications: SheetApplication[]; skipped: Skip[]; unreadable: Set<string>; shape: ShapeReport } {
  const applications: SheetApplication[] = [];
  /** Addresses with an unreadable column Y on any row: the whole person waits for a human. */
  const unreadable = new Set<string>();
  const skipped: Skip[] = [];
  const data = table.slice(1); // row 1 is the (drifted) header
  let emails = 0;
  let stamps = 0;
  let applied = 0;
  let grades = 0;
  let decisions = 0;

  data.forEach((values, index) => {
    const row = index + 2;
    if (values.every((value) => !value.trim())) return; // spacer rows

    const email = cell(values, SHEET_COL.email).toLowerCase();
    const submittedAt = parseSheetTime(cell(values, SHEET_COL.timestamp), timeZone);
    const decision = parseDecision(cell(values, SHEET_COL.decision));
    if (email.includes("@")) emails += 1;
    if (submittedAt) stamps += 1;
    if (/^applied$/i.test(cell(values, SHEET_COL.appliedMarker))) applied += 1;
    if (GRADE_LIKE.test(cell(values, SHEET_COL.grade))) grades += 1;
    if (decision.ok) decisions += 1;

    if (!email.includes("@")) {
      skipped.push({ row, why: "no email address in column C" });
      return;
    }
    if (!decision.ok) {
      skipped.push({ row, why: "column Y isn't a decision word" });
      unreadable.add(email);
      return;
    }
    if (!submittedAt) {
      skipped.push({ row, why: "column A isn't a timestamp" });
      return;
    }

    const answers = cleanAnswers(
      Object.fromEntries(
        (["phone", "school", "grade", "interest", "chapter", "startup_role", "background", "letter", "instagram", "linkedin", "github", "other_link", "resume_url", "comments", "extra_file_url"] as const).map(
          (column) => [column, cell(values, SHEET_COL[column])],
        ),
      ),
    );

    applications.push({
      row,
      email,
      name: cell(values, SHEET_COL.name) || null,
      submittedAt,
      answers,
      reviewer: cell(values, SHEET_COL.reviewer) || null,
      category: cell(values, SHEET_COL.category) || null,
      status: decision.status,
      undecided: decision.undecided,
      decision: cell(values, SHEET_COL.decision),
    });
  });

  const counted = data.filter((values) => values.some((value) => value.trim())).length;
  return {
    applications,
    skipped,
    unreadable,
    shape: {
      dataRows: counted,
      emailInC: pct(emails, counted),
      timestampInA: pct(stamps, counted),
      appliedInL: pct(applied, counted),
      gradeLikeInF: pct(grades, counted),
      decisionReadableInY: pct(decisions, counted),
    },
  };
}

// One person, one row --------------------------------------------------------------------------

/**
 * The Sheet holds a row per submission; `applications` holds a row per
 * person, and it has to stay that way. Decision mail (lib/actions/decisions.ts)
 * picks each address's newest row, so a second, newer row for someone who
 * was already rejected or already written to would put them back in the
 * queue for a mail they must not get.
 *
 * So the backfill collapses exactly as the Sheet push does
 * (lib/sheet-decisions.ts): an unreadable column Y anywhere skips the person
 * for a human to fix, a real decision beats a blank one, and between two of
 * the same kind the newer wins.
 */
export function collapsePeople(applications: readonly SheetApplication[], unreadable: ReadonlySet<string>): {
  people: SheetApplication[];
  collapsed: number;
} {
  const byEmail = new Map<string, SheetApplication>();
  let considered = 0;
  for (const app of applications) {
    if (unreadable.has(app.email)) continue;
    considered += 1;
    const have = byEmail.get(app.email);
    if (!have) {
      byEmail.set(app.email, app);
      continue;
    }
    if (have.undecided !== app.undecided) {
      if (have.undecided) byEmail.set(app.email, app);
      continue;
    }
    if ((app.submittedAt ?? "") >= (have.submittedAt ?? "")) byEmail.set(app.email, app);
  }
  return { people: [...byEmail.values()], collapsed: considered - byEmail.size };
}

// Matching against the database ---------------------------------------------------------------

export type DbApplication = { id: string; email: string; submitted_at: string } & Record<string, unknown>;

/**
 * How far a stored timestamp may sit from the Sheet's and still be the same
 * submission. The decisions push parsed Sheet times in the server's zone
 * (UTC) rather than the Sheet's, so its rows are hours off.
 */
export const MATCH_WINDOW_MS = 36 * 60 * 60 * 1000;

export type Plan = {
  matched: number;
  /** Existing rows that gain answers. Only blank columns are filled. */
  fills: { id: string; fields: Answers & { name?: string } }[];
  /** People the database has never seen. */
  inserts: SheetApplication[];
  /** Addresses in the database that no Sheet row carries: web-only, or lost from the Sheet. */
  dbOnly: number;
};

export function planBackfill(people: readonly SheetApplication[], db: readonly DbApplication[]): Plan {
  const byEmail = new Map<string, DbApplication[]>();
  for (const record of db) {
    const key = record.email.trim().toLowerCase();
    byEmail.set(key, [...(byEmail.get(key) ?? []), record]);
  }

  const fills: Plan["fills"] = [];
  const inserts: SheetApplication[] = [];
  const seen = new Set<string>();
  let matched = 0;

  for (const person of people) {
    seen.add(person.email);
    const records = byEmail.get(person.email) ?? [];
    if (!records.length) {
      inserts.push(person);
      continue;
    }
    // The submission this Sheet row is, if its time lines up; otherwise the
    // person's newest row, which is the one the site and the mail read.
    const at = Date.parse(person.submittedAt ?? "");
    const near = records
      .map((record) => ({ record, gap: Math.abs(Date.parse(record.submitted_at) - at) }))
      .filter(({ gap }) => gap <= MATCH_WINDOW_MS)
      .sort((a, b) => a.gap - b.gap)[0]?.record;
    const target = near ?? [...records].sort((a, b) => b.submitted_at.localeCompare(a.submitted_at))[0];

    matched += 1;
    const fields: Answers & { name?: string } = fillNulls(target, person.answers);
    if (!target.name && person.name) fields.name = person.name;
    if (Object.keys(fields).length) fills.push({ id: target.id, fields });
  }

  const dbOnly = [...byEmail.keys()].filter((email) => !seen.has(email)).length;
  return { matched, fills, inserts, dbOnly };
}

/**
 * A new `applications` row for someone the database has never seen, exactly
 * as the Sheet push would have written them, plus their answers. Never
 * marked contacted: a CSV can't see the "(sent out)" tabs, so the next Sheet
 * push is what sets that flag, and nobody is mailed before a person builds
 * and reads the queue.
 */
export function insertRow(app: SheetApplication): Record<string, unknown> {
  return {
    email: app.email,
    name: app.name,
    ...app.answers,
    status: app.status,
    reviewer: app.reviewer,
    selected_for: app.category,
    source: "sheet_backfill",
    submitted_at: app.submittedAt,
    sheet_row: { row: app.row, decision: app.decision, category: app.category },
  };
}
