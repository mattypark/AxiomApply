import { test } from "node:test";
import assert from "node:assert/strict";
import { cleanAnswers, fillNulls, parseDecision, parseSheetTime, planDecision } from "../lib/sheet-shared.ts";
import { collapsePeople, insertRow, parseCsv, planBackfill, readSheet, type SheetApplication } from "../lib/sheet-backfill.ts";

// Timestamps -------------------------------------------------------------------------------

test("Sheet times are Houston wall-clock times, across daylight saving", () => {
  assert.equal(parseSheetTime("9/14/2026 13:22:05"), "2026-09-14T18:22:05.000Z"); // CDT, UTC-5
  assert.equal(parseSheetTime("1/14/2026 13:22:05"), "2026-01-14T19:22:05.000Z"); // CST, UTC-6
  assert.equal(parseSheetTime("6/6/2026"), "2026-06-06T05:00:00.000Z");
  assert.equal(parseSheetTime("2026-06-06T10:00:00Z"), "2026-06-06T10:00:00.000Z");
  assert.equal(parseSheetTime("POOL"), null);
  assert.equal(parseSheetTime(""), null);
});

test("column Y: blank is undecided, unknown words refuse", () => {
  assert.deepEqual(parseDecision(" Waitlisted "), { ok: true, status: "waitlist", undecided: false });
  assert.deepEqual(parseDecision(""), { ok: true, status: "applied", undecided: true });
  assert.deepEqual(parseDecision("POOL"), { ok: false });
});

// Answers ---------------------------------------------------------------------------------------

test("answers from untrusted input: strings only, trimmed, known columns only", () => {
  assert.deepEqual(cleanAnswers({ school: "  Lamar ", phone: 5551234, is_admin: "true", github: "" }), { school: "Lamar" });
  assert.deepEqual(cleanAnswers(null), {});
});

test("the Sheet only fills what the database left blank", () => {
  const fields = fillNulls({ school: "Lamar", grade: null, phone: "  " }, { school: "Other High", grade: "11th grade", phone: "555" });
  assert.deepEqual(fields, { grade: "11th grade", phone: "555" });
});

// Decisions made in both places ---------------------------------------------------------------

const incoming = (decision: string, status: "applied" | "accepted" | "rejected" | "waitlist", contacted = false) => ({
  decision,
  status,
  undecided: status === "applied",
  contacted,
});

test("Sheet-decided rows follow the Sheet, as before", () => {
  assert.deepEqual(planDecision({ status: "applied", contacted: false, decidedVia: null, sheetDecision: null }, incoming("Rejected", "rejected")), { kind: "apply" });
  assert.deepEqual(planDecision({ status: "rejected", contacted: false, decidedVia: "sheet", sheetDecision: "Rejected" }, incoming("rejected", "rejected")), { kind: "skip" });
});

test("a database without 0020 behaves exactly as the old push did", () => {
  assert.deepEqual(planDecision({ status: "rejected", contacted: false }, incoming("Rejected", "rejected")), { kind: "skip" });
  assert.deepEqual(planDecision({ status: "applied", contacted: false }, incoming("Rejected", "rejected")), { kind: "apply" });
});

test("an HQ decision stands while column Y hasn't moved", () => {
  // First push after HQ decided: Y is recorded, status untouched.
  assert.deepEqual(planDecision({ status: "accepted", contacted: false, decidedVia: "hq", sheetDecision: null }, incoming("", "applied")), { kind: "record" });
  // Later pushes with the same Y: nothing to do.
  assert.deepEqual(planDecision({ status: "accepted", contacted: false, decidedVia: "hq", sheetDecision: "" }, incoming("", "applied")), { kind: "skip" });
  // The contacted flag still gets through.
  assert.deepEqual(planDecision({ status: "accepted", contacted: false, decidedVia: "hq", sheetDecision: "" }, incoming("", "applied", true)), { kind: "record" });
});

test("a change in column Y after HQ decided wins", () => {
  assert.deepEqual(planDecision({ status: "accepted", contacted: false, decidedVia: "hq", sheetDecision: "" }, incoming("Rejected", "rejected")), { kind: "apply" });
  assert.deepEqual(planDecision({ status: "accepted", contacted: false, decidedVia: "hq", sheetDecision: "Waitlist" }, incoming("waitlist ", "waitlist")), { kind: "skip" });
});

// CSV ------------------------------------------------------------------------------------------------

test("csv: quotes, doubled quotes, newlines inside quotes, CRLF, BOM", () => {
  const rows = parseCsv('﻿a,b\r\n"x, y","say ""hi"""\n"line one\nline two",\n');
  assert.deepEqual(rows, [
    ["a", "b"],
    ["x, y", 'say "hi"'],
    ["line one\nline two", ""],
  ]);
});

// The backfill -----------------------------------------------------------------------------------

/** A Sheet row in webhook column order, A through Z. */
function sheetRow(over: Partial<Record<"a" | "b" | "c" | "d" | "e" | "f" | "l" | "x" | "y", string>>): string[] {
  const row = Array.from({ length: 26 }, () => "");
  row[0] = over.a ?? "9/14/2026 13:22:05";
  row[1] = over.b ?? "Test Applicant";
  row[2] = over.c ?? "test@example.com";
  row[3] = over.d ?? "(555) 010-0001";
  row[4] = over.e ?? "Example High";
  row[5] = over.f ?? "11th grade";
  row[11] = over.l ?? "Applied";
  row[23] = over.x ?? "";
  row[24] = over.y ?? "";
  return row;
}

const HEADER = Array.from({ length: 26 }, (_, i) => `h${i}`);

test("readSheet: skips blank rows, refuses unreadable ones, reports shape as percentages", () => {
  const { applications, skipped, unreadable, shape } = readSheet([
    HEADER,
    sheetRow({}),
    Array.from({ length: 26 }, () => ""),
    sheetRow({ c: "not an email" }),
    sheetRow({ c: "pool@example.com", y: "POOL" }),
  ]);
  assert.equal(applications.length, 1);
  assert.equal(applications[0].row, 2);
  assert.equal(applications[0].answers.school, "Example High");
  assert.equal(applications[0].submittedAt, "2026-09-14T18:22:05.000Z");
  assert.deepEqual(skipped.map((s) => s.row), [4, 5]);
  assert.ok(unreadable.has("pool@example.com"));
  assert.equal(shape.dataRows, 3);
  assert.equal(shape.emailInC, 67);
  assert.equal(shape.appliedInL, 100);
});

const app = (over: Partial<SheetApplication>): SheetApplication => ({
  row: 2,
  email: "test@example.com",
  name: "Test Applicant",
  submittedAt: "2026-09-14T18:22:05.000Z",
  answers: { school: "Example High" },
  reviewer: null,
  category: null,
  status: "applied",
  undecided: true,
  decision: "",
  ...over,
});

test("one person, one row: a decision beats a blank, then newer wins", () => {
  const { people, collapsed } = collapsePeople(
    [
      app({ row: 2, submittedAt: "2026-08-01T00:00:00.000Z", status: "rejected", undecided: false, decision: "Rejected" }),
      app({ row: 3, submittedAt: "2026-09-01T00:00:00.000Z" }),
      app({ row: 4, email: "other@example.com" }),
      app({ row: 5, email: "pool@example.com" }),
    ],
    new Set(["pool@example.com"]),
  );
  assert.deepEqual(people.map((p) => p.row).sort(), [2, 4]);
  assert.equal(collapsed, 1);
});

test("the plan fills blanks on the row the database has, and inserts only new people", () => {
  const plan = planBackfill(
    [
      app({ email: "known@example.com", answers: { school: "Example High", grade: "11th grade" } }),
      app({ email: "new@example.com" }),
    ],
    [
      // The decisions push's row: five hours off (parsed as UTC), answers empty.
      { id: "k1", email: "Known@example.com", submitted_at: "2026-09-14T13:22:05.000Z", name: null, school: null, grade: "10th grade" },
      { id: "w1", email: "web-only@example.com", submitted_at: "2026-09-20T00:00:00.000Z" },
    ],
  );
  assert.equal(plan.matched, 1);
  assert.deepEqual(plan.fills, [{ id: "k1", fields: { school: "Example High", name: "Test Applicant" } }]);
  assert.deepEqual(plan.inserts.map((p) => p.email), ["new@example.com"]);
  assert.equal(plan.dbOnly, 1);
});

test("with no row near in time, the person's newest row gets the answers", () => {
  const plan = planBackfill(
    [app({ email: "known@example.com" })],
    [
      { id: "old", email: "known@example.com", submitted_at: "2026-01-01T00:00:00.000Z", school: null },
      { id: "new", email: "known@example.com", submitted_at: "2026-06-01T00:00:00.000Z", school: null },
    ],
  );
  assert.deepEqual(plan.fills.map((f) => f.id), ["new"]);
});

test("an inserted row reads like a Sheet push row, never marked contacted", () => {
  const row = insertRow(app({ status: "waitlist", undecided: false, decision: "waitlist", reviewer: "Frank" }));
  assert.equal(row.source, "sheet_backfill");
  assert.equal(row.status, "waitlist");
  assert.equal(row.reviewer, "Frank");
  assert.equal(row.school, "Example High");
  assert.equal("contacted_elsewhere" in row, false);
});
