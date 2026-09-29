import type {
  Bar,
  Day,
  Dimension,
  FunnelStep,
  HqFilters,
  HqList,
  HqPage,
  HqRow,
  HqStats,
  Kpis,
  Range,
  Side,
} from "./types";

/**
 * Slicing and counting for HQ: one implementation, used by the live adapter
 * on the server and by the prototype's mock client in the browser.
 *
 * Live, this runs on the server over light rows (no phone numbers), so the
 * page only ever receives the counts and one page of the list. Pure and
 * dependency-free, so the tests run under plain `node --test`.
 */

/** Days are Houston days: "today" and "this week" mean what they mean to Matthew. */
export const HQ_TIME_ZONE = "America/Chicago";

const SIDES: Side[] = ["intern", "startup", "chapter"];
const SIDE_LABEL: Record<Side, string> = { intern: "Intern", startup: "Startup", chapter: "Chapter" };
export const RANGE_DAYS: Record<Exclude<Range, "all">, number> = { "7": 7, "30": 30, "60": 60 };

const formatters = new Map<string, Intl.DateTimeFormat>();

/** An ISO timestamp → its calendar day ("YYYY-MM-DD") in `timeZone`. */
export function dayKey(iso: string, timeZone = HQ_TIME_ZONE): string {
  let format = formatters.get(timeZone);
  if (!format) {
    // en-CA formats as YYYY-MM-DD.
    format = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" });
    formatters.set(timeZone, format);
  }
  return format.format(new Date(iso));
}

export function dayNumber(key: string): number {
  const [y, m, d] = key.split("-").map(Number);
  return Date.UTC(y, m - 1, d) / 86_400_000;
}

export function addDays(key: string, days: number): string {
  return new Date((dayNumber(key) + days) * 86_400_000).toISOString().slice(0, 10);
}

function inRange(row: HqRow, range: Range, today: string): boolean {
  if (range === "all") return true;
  return dayKey(row.submittedAt) > addDays(today, -RANGE_DAYS[range]);
}

function matches(row: HqRow, query: string): boolean {
  const haystack = [row.name, row.email, row.org, row.chapter, row.headline].join(" ").toLowerCase();
  return haystack.includes(query);
}

/** Every filter, minus the dimensions named in `skip`. */
export function applyFilters(rows: readonly HqRow[], filters: HqFilters, today: string, skip: Dimension[] = []): HqRow[] {
  const query = filters.query.trim().toLowerCase();
  return rows.filter((row) => {
    if (!inRange(row, filters.range, today)) return false;
    if (filters.side !== "all" && row.side !== filters.side) return false;
    if (filters.status !== "all" && row.status !== filters.status) return false;
    for (const dim of ["chapter", "org", "grade", "interest"] as const) {
      if (skip.includes(dim)) continue;
      if (filters[dim] && row[dim] !== filters[dim]) return false;
    }
    return query ? matches(row, query) : true;
  });
}

/** Counts per value of a dimension, biggest first; ordinal ones keep `order`. Blanks are left out. */
export function countBy(rows: readonly HqRow[], dim: Dimension, order?: readonly string[]): Bar[] {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const value = row[dim];
    if (value) counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  if (order) {
    return order.filter((label) => counts.has(label)).map((label) => ({ label, value: counts.get(label) ?? 0 }));
  }
  return [...counts]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));
}

export function countSides(rows: readonly HqRow[]): Bar[] {
  return SIDES.map((side) => ({ label: SIDE_LABEL[side], value: rows.filter((row) => row.side === side).length })).filter(
    (bar) => bar.value > 0,
  );
}

/** One entry per day in the range, oldest first, zeros included. "All" spans back to the first application. */
export function daily(rows: readonly HqRow[], range: Range, today: string): Day[] {
  let span = range === "all" ? 60 : RANGE_DAYS[range];
  if (range === "all" && rows.length) {
    const first = Math.min(...rows.map((row) => dayNumber(dayKey(row.submittedAt))));
    span = Math.min(366, Math.max(span, dayNumber(today) - first + 1));
  }
  const days: Day[] = Array.from({ length: span }, (_, i) => ({
    date: addDays(today, i - span + 1),
    intern: 0,
    startup: 0,
    chapter: 0,
  }));
  const index = new Map(days.map((day, i) => [day.date, i]));
  for (const row of rows) {
    const at = index.get(dayKey(row.submittedAt));
    if (at !== undefined) days[at][row.side] += 1;
  }
  return days;
}

const DECIDED = new Set(["accepted", "waitlist", "rejected"]);

export function funnel(rows: readonly HqRow[]): FunnelStep[] {
  const live = rows.filter((row) => row.status !== "withdrawn");
  return [
    { key: "received", label: "Received", value: live.length },
    { key: "read", label: "Read", value: live.filter((row) => row.status !== "new").length },
    { key: "decided", label: "Decided", value: live.filter((row) => DECIDED.has(row.status)).length },
    { key: "accepted", label: "Accepted", value: live.filter((row) => row.status === "accepted").length },
  ];
}

/** Headline numbers. "This week" ignores the range filter: it always means the last 7 days. */
export function kpis(rows: readonly HqRow[], weekRows: readonly HqRow[], today: string): Kpis {
  const weekAgo = addDays(today, -7);
  const twoWeeksAgo = addDays(today, -14);
  const unread = rows.filter((row) => row.status === "new");
  // Only a stamped read has a date. A reviewer's name in the Sheet says
  // someone read it, not when, so those rows are left out of the median.
  const waits = rows
    .filter((row) => row.readAt)
    .map((row) => dayNumber(dayKey(row.readAt as string)) - dayNumber(dayKey(row.submittedAt)))
    .sort((a, b) => a - b);
  const day = (row: HqRow) => dayKey(row.submittedAt);
  return {
    total: rows.length,
    thisWeek: weekRows.filter((row) => day(row) > weekAgo).length,
    lastWeek: weekRows.filter((row) => day(row) > twoWeeksAgo && day(row) <= weekAgo).length,
    unread: unread.length,
    oldestUnreadDays: unread.reduce((max, row) => Math.max(max, dayNumber(today) - dayNumber(day(row))), 0),
    medianDaysToRead: waits.length ? waits[Math.floor(waits.length / 2)] : null,
  };
}

/** Everything the charts and the KPI strip need, for one filter state. */
export function stats(
  rows: readonly HqRow[],
  filters: HqFilters,
  today: string,
  gradeOrder: readonly string[],
  extra: Pick<HqStats, "missing" | "needsMigration"> = { missing: [], needsMigration: false },
): HqStats {
  const slice = applyFilters(rows, filters, today);
  const except = (dim: Dimension) => applyFilters(rows, filters, today, [dim]);
  return {
    kpis: kpis(slice, applyFilters(rows, { ...filters, range: "all" }, today), today),
    daily: daily(slice, filters.range, today),
    funnel: funnel(slice),
    by: {
      side: countSides(applyFilters(rows, { ...filters, side: "all" }, today)),
      chapter: countBy(except("chapter"), "chapter"),
      interest: countBy(except("interest"), "interest"),
      org: countBy(except("org").filter((row) => row.side !== "startup"), "org"),
      grade: countBy(except("grade"), "grade", gradeOrder),
    },
    everything: rows.length,
    ...extra,
  };
}

/** One page of the list. "Oldest unread" is the reviewing order: whoever has waited longest. */
export function listPage(rows: readonly HqRow[], filters: HqFilters, today: string, page: HqPage): HqList {
  const slice = applyFilters(rows, filters, today);
  const sorted =
    page.sort === "newest"
      ? [...slice].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
      : [...slice].sort(
          (a, b) => Number(a.status !== "new") - Number(b.status !== "new") || a.submittedAt.localeCompare(b.submittedAt),
        );
  const size = Math.max(1, Math.min(page.size, 100));
  const offset = Math.max(0, page.offset);
  return { rows: sorted.slice(offset, offset + size), total: sorted.length };
}

// CSV -------------------------------------------------------------------------------

/** A leading = + - @ would run as a formula in a spreadsheet; a quote in front defuses it. */
export function csvCell(value: string | number | null | undefined): string {
  const text = String(value ?? "");
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function toCsv(rows: readonly (HqRow & { phone: string | null })[]): string {
  const header = [
    "id",
    "side",
    "name",
    "email",
    "phone",
    "school_or_company",
    "chapter",
    "grade",
    "interest",
    "status",
    "submitted",
    "read",
    "reviewer",
    "decided",
    "sheet_row",
  ];
  const lines = rows.map((row) =>
    [
      row.id,
      row.side,
      row.name,
      row.email,
      row.phone,
      row.org,
      row.chapter,
      row.grade,
      row.interest,
      row.status,
      row.submittedAt,
      row.readAt,
      row.reviewer,
      row.decidedAt,
      row.sheetRow,
    ]
      .map(csvCell)
      .join(","),
  );
  return [header.map(csvCell).join(","), ...lines].join("\r\n");
}
