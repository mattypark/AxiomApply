import { test } from "node:test";
import assert from "node:assert/strict";
import { addDays, applyFilters, csvCell, daily, dayKey, funnel, kpis, listPage, stats, toCsv } from "../lib/data/hq/aggregate.ts";
import type { HqFilters, HqRow } from "../lib/data/hq/types.ts";

const TODAY = "2026-09-28";
const FILTERS: HqFilters = {
  range: "30",
  side: "all",
  status: "all",
  query: "",
  chapter: null,
  org: null,
  grade: null,
  interest: null,
};

/** Noon in Houston on the given day, so the day never slips across a zone boundary. */
const at = (day: string) => `${day}T17:00:00.000Z`;

function row(over: Partial<HqRow> & { id: string }): HqRow {
  return {
    side: "intern",
    name: "Test Applicant",
    email: "test@example.com",
    org: "Example High",
    chapter: "Bay Area",
    grade: "11th grade",
    interest: "AI",
    headline: "Backend",
    status: "new",
    submittedAt: at(TODAY),
    readAt: null,
    reviewer: null,
    decidedAt: null,
    decidedVia: null,
    sheetRow: null,
    ...over,
  };
}

const ROWS: HqRow[] = [
  row({ id: "a", submittedAt: at("2026-09-27") }),
  row({ id: "b", submittedAt: at("2026-09-25"), status: "read", readAt: at("2026-09-27"), chapter: "Online" }),
  row({ id: "c", submittedAt: at("2026-09-10"), status: "accepted", readAt: at("2026-09-12") }),
  row({ id: "d", side: "startup", org: "Example Labs", chapter: null, grade: null, interest: null, submittedAt: at("2026-09-20") }),
  row({ id: "e", side: "chapter", status: "withdrawn", submittedAt: at("2026-09-18"), chapter: "Houston" }),
  row({ id: "old", submittedAt: at("2026-07-01"), status: "rejected" }),
];

test("day keys are Houston days", () => {
  // 03:00 UTC on the 28th is still the 27th in Houston.
  assert.equal(dayKey("2026-09-28T03:00:00Z"), "2026-09-27");
  assert.equal(addDays("2026-09-01", -1), "2026-08-31");
});

test("the range drops rows older than it", () => {
  assert.equal(applyFilters(ROWS, FILTERS, TODAY).length, 5);
  assert.equal(applyFilters(ROWS, { ...FILTERS, range: "7" }, TODAY).length, 2);
  assert.equal(applyFilters(ROWS, { ...FILTERS, range: "all" }, TODAY).length, 6);
});

test("search covers name, email, org, chapter and headline", () => {
  assert.deepEqual(
    applyFilters(ROWS, { ...FILTERS, query: "labs" }, TODAY).map((r) => r.id),
    ["d"],
  );
});

test("a breakdown ignores its own filter", () => {
  const filters = { ...FILTERS, chapter: "Online" };
  const result = stats(ROWS, filters, TODAY, []);
  // The chapter chart still lists every chapter...
  assert.ok(result.by.chapter.some((bar) => bar.label === "Bay Area"));
  // ...while everything else is narrowed to Online.
  assert.equal(result.kpis.total, 1);
});

test("the funnel leaves out withdrawn and counts read, decided, accepted", () => {
  assert.deepEqual(
    funnel(applyFilters(ROWS, FILTERS, TODAY)).map((step) => step.value),
    [4, 2, 1, 1],
  );
});

test("kpis: unread, oldest unread, median wait from stamped reads only", () => {
  const slice = applyFilters(ROWS, FILTERS, TODAY);
  const result = kpis(slice, ROWS, TODAY);
  assert.equal(result.unread, 2);
  assert.equal(result.oldestUnreadDays, 8);
  assert.equal(result.medianDaysToRead, 2);
  assert.equal(result.thisWeek, 2);
  assert.equal(result.lastWeek, 2);
});

test("daily has one entry per day, oldest first, stacked by side", () => {
  const days = daily(ROWS, "7", TODAY);
  assert.equal(days.length, 7);
  assert.equal(days[6].date, TODAY);
  assert.equal(days.find((day) => day.date === "2026-09-27")?.intern, 1);
});

test("'All' reaches back to the first application", () => {
  const days = daily(ROWS, "all", TODAY);
  assert.equal(days[0].date, "2026-07-01");
});

test("oldest-unread puts the longest wait first", () => {
  const page = listPage(ROWS, FILTERS, TODAY, { offset: 0, size: 2, sort: "oldest-unread" });
  assert.deepEqual(page.rows.map((r) => r.id), ["d", "a"]);
  assert.equal(page.total, 5);
});

test("newest pages from the top", () => {
  const page = listPage(ROWS, { ...FILTERS, range: "all" }, TODAY, { offset: 1, size: 2, sort: "newest" });
  assert.deepEqual(page.rows.map((r) => r.id), ["b", "d"]);
});

test("csv cells are quoted and formulas defused", () => {
  assert.equal(csvCell('=HYPERLINK("x")'), `"'=HYPERLINK(""x"")"`);
  assert.equal(csvCell("+1 555"), `"'+1 555"`);
  assert.equal(csvCell("@handle"), `"'@handle"`);
  assert.equal(csvCell(null), '""');
  const csv = toCsv([{ ...ROWS[0], phone: "(555) 010-0001" }]);
  assert.match(csv.split("\r\n")[0], /"phone"/);
  assert.match(csv, /\(555\) 010-0001/);
});
