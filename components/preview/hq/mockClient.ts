import { MOCK_APPLICATIONS, TODAY, type MockApplication } from "@/components/preview/mock-data";
import { GRADE_ORDER, canonicalGrade, dbStatusFor } from "@/lib/data/hq/normalise";
import { applyFilters, listPage, stats, toCsv } from "@/lib/data/hq/aggregate";
import type { HqClient, HqDetail, HqRow, HqStatus } from "@/lib/data/hq/types";

/**
 * The prototype's HQ client: the live dashboard's own components and the
 * live aggregation code, over invented rows held in memory. No requests.
 * Decisions and reads change this page's memory only.
 *
 * `mode` fakes the states the real client can reach: a load that never
 * finishes, a load that fails, and a database with nothing in it yet.
 */

export type MockMode = "ready" | "loading" | "error" | "empty";

/** Noon in Houston, so a mock day never slides into the day before. */
const at = (day: string | null) => (day ? `${day}T17:00:00.000Z` : null);

function status(app: MockApplication): HqStatus {
  if (app.outcome) return app.outcome;
  return app.readAt ? "read" : "new";
}

function toRow(app: MockApplication): HqRow {
  return {
    id: app.id,
    side: app.side,
    name: app.name,
    email: app.email,
    org: app.org,
    chapter: app.chapter,
    grade: canonicalGrade(app.grade),
    interest: app.interest,
    headline: app.headline,
    status: status(app),
    submittedAt: at(app.submittedAt) as string,
    readAt: at(app.readAt),
    reviewer: app.reviewer,
    decidedAt: at(app.decidedAt),
    decidedVia: app.outcome ? "sheet" : null,
    sheetRow: app.sheetRow,
  };
}

const never = () => new Promise<never>(() => {});
const fail = () => Promise.reject(new Error("mock failure"));

export function mockHqClient(mode: MockMode): HqClient {
  const source = new Map(MOCK_APPLICATIONS.map((app) => [app.id, app]));
  let rows = mode === "empty" ? [] : MOCK_APPLICATIONS.map(toRow);

  const guard = <T>(run: () => T): Promise<T> =>
    mode === "loading" ? never() : mode === "error" ? fail() : Promise.resolve(run());

  const patch = (id: string, changes: Partial<HqRow>) => {
    rows = rows.map((row) => (row.id === id ? { ...row, ...changes } : row));
  };

  return {
    stats: (filters) => guard(() => stats(rows, filters, TODAY, GRADE_ORDER)),
    list: (filters, page) => guard(() => listPage(rows, filters, TODAY, page)),
    get: (id) =>
      guard(() => {
        const row = rows.find((candidate) => candidate.id === id);
        if (!row) return null;
        const detail: HqDetail = {
          ...row,
          answers: [{ label: "What they're looking for", value: row.headline }],
          sheetDecision: null,
          decidedBy: row.decidedVia === "hq" ? "Matthew" : null,
        };
        return detail;
      }),
    contact: (id) => guard(() => (source.has(id) ? { email: source.get(id)!.email, phone: source.get(id)!.phone } : null)),
    decide: (id, decision) =>
      guard(() => {
        const row = rows.find((candidate) => candidate.id === id);
        if (!row || !dbStatusFor(row.side, decision)) return { ok: false, error: "Not on this side." };
        const now = at(TODAY);
        patch(id, { status: decision, decidedAt: now, decidedVia: "hq", readAt: row.readAt ?? now, reviewer: row.reviewer ?? "Matthew" });
        return { ok: true };
      }),
    markRead: (id) =>
      guard(() => {
        patch(id, { status: "read", readAt: at(TODAY), reviewer: "Matthew" });
        return { ok: true };
      }),
    exportCsv: (filters) =>
      guard(() => toCsv(applyFilters(rows, filters, TODAY).map((row) => ({ ...row, phone: source.get(row.id)?.phone ?? null })))),
  };
}
