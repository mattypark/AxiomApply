import type { Side } from "@/lib/apply-sides";
import { TODAY, daysAgo, type MockApplication } from "@/components/preview/mock-data";
import { boardStatus, type BoardStatus } from "@/components/preview/labels";

/**
 * Pure slicing and counting for the HQ prototype.
 *
 * In the prototype this runs in the browser over mock rows. In the real
 * dashboard the same shapes come back from the server (GROUP BY queries in
 * the data adapter — see docs/DESIGN-AFTER-SUBMIT.md, "Data seam"), so the
 * browser never holds every applicant's contact details just to draw a bar.
 */

export type Range = "7" | "30" | "60" | "all";
export type Dimension = "chapter" | "org" | "grade" | "interest";

export type Filters = {
  range: Range;
  side: Side | "all";
  status: BoardStatus | "all";
  query: string;
  chapter: string | null;
  org: string | null;
  grade: string | null;
  interest: string | null;
};

export const EMPTY_FILTERS: Filters = {
  range: "30",
  side: "all",
  status: "all",
  query: "",
  chapter: null,
  org: null,
  grade: null,
  interest: null,
};

export const RANGE_DAYS: Record<Exclude<Range, "all">, number> = { "7": 7, "30": 30, "60": 60 };

function inRange(app: MockApplication, range: Range) {
  if (range === "all") return true;
  return app.submittedAt > daysAgo(RANGE_DAYS[range]);
}

/** Every filter, minus the dimensions named in `skip`. */
export function applyFilters(rows: readonly MockApplication[], filters: Filters, skip: Dimension[] = []) {
  const query = filters.query.trim().toLowerCase();
  return rows.filter((app) => {
    if (!inRange(app, filters.range)) return false;
    if (filters.side !== "all" && app.side !== filters.side) return false;
    if (filters.status !== "all" && boardStatus(app) !== filters.status) return false;
    for (const dim of ["chapter", "org", "grade", "interest"] as const) {
      if (skip.includes(dim)) continue;
      if (filters[dim] && app[dim] !== filters[dim]) return false;
    }
    if (query) {
      const haystack = `${app.name} ${app.email} ${app.org} ${app.chapter} ${app.headline}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}

export type Bar = { label: string; value: number };

/** Counts per value of a dimension, biggest first. Rows without one are left out. */
export function countBy(rows: readonly MockApplication[], dim: Dimension, order?: readonly string[]): Bar[] {
  const counts = new Map<string, number>();
  for (const app of rows) {
    const value = app[dim];
    if (value) counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  const bars = [...counts].map(([label, value]) => ({ label, value }));
  // Ordinal dimensions (grade) keep their own order; the rest sort by size.
  if (order) return order.filter((label) => counts.has(label)).map((label) => ({ label, value: counts.get(label) ?? 0 }));
  return bars.sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));
}

export type Day = { date: string } & Record<Side, number>;

/** One entry per calendar day in the range, oldest first, zeros included. */
export function daily(rows: readonly MockApplication[], range: Range): Day[] {
  const span = range === "all" ? 60 : RANGE_DAYS[range];
  const days: Day[] = Array.from({ length: span }, (_, i) => ({
    date: daysAgo(span - 1 - i),
    intern: 0,
    startup: 0,
    chapter: 0,
  }));
  const index = new Map(days.map((day, i) => [day.date, i]));
  for (const app of rows) {
    const at = index.get(app.submittedAt);
    if (at !== undefined) days[at][app.side] += 1;
  }
  return days;
}

export type FunnelStep = { key: string; label: string; value: number };

export function funnel(rows: readonly MockApplication[]): FunnelStep[] {
  const live = rows.filter((app) => app.outcome !== "withdrawn");
  return [
    { key: "received", label: "Received", value: live.length },
    { key: "read", label: "Read", value: live.filter((app) => app.readAt).length },
    { key: "decided", label: "Decided", value: live.filter((app) => app.outcome).length },
    { key: "accepted", label: "Accepted", value: live.filter((app) => app.outcome === "accepted").length },
  ];
}

function dayNumber(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d) / 86_400_000;
}

export type Kpis = {
  total: number;
  thisWeek: number;
  lastWeek: number;
  unread: number;
  oldestUnreadDays: number;
  medianDaysToRead: number | null;
};

/** Headline numbers. "This week" ignores the range filter: it always means the last 7 days. */
export function kpis(rows: readonly MockApplication[], sideRows: readonly MockApplication[]): Kpis {
  const weekAgo = daysAgo(7);
  const twoWeeksAgo = daysAgo(14);
  const unread = rows.filter((app) => !app.readAt && !app.outcome);
  const waits = rows
    .filter((app) => app.readAt)
    .map((app) => dayNumber(app.readAt as string) - dayNumber(app.submittedAt))
    .sort((a, b) => a - b);
  return {
    total: rows.length,
    thisWeek: sideRows.filter((app) => app.submittedAt > weekAgo).length,
    lastWeek: sideRows.filter((app) => app.submittedAt > twoWeeksAgo && app.submittedAt <= weekAgo).length,
    unread: unread.length,
    oldestUnreadDays: unread.reduce((max, app) => Math.max(max, dayNumber(TODAY) - dayNumber(app.submittedAt)), 0),
    medianDaysToRead: waits.length ? waits[Math.floor(waits.length / 2)] : null,
  };
}

/** The list's CSV. Quoted throughout; a leading = + - @ is defused so a spreadsheet never runs it. */
export function toCsv(rows: readonly MockApplication[]): string {
  const header = ["id", "side", "name", "email", "school_or_company", "chapter", "grade", "interest", "status", "submitted", "read", "reviewer", "sheet_row"];
  const cell = (value: string | number | null) => {
    const text = String(value ?? "");
    const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
    return `"${safe.replace(/"/g, '""')}"`;
  };
  const lines = rows.map((app) =>
    [app.id, app.side, app.name, app.email, app.org, app.chapter, app.grade, app.interest, boardStatus(app), app.submittedAt, app.readAt, app.reviewer, app.sheetRow]
      .map(cell)
      .join(","),
  );
  return [header.join(","), ...lines].join("\n");
}
