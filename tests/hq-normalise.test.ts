import { test } from "node:test";
import assert from "node:assert/strict";
import {
  canonicalGrade,
  canonicalInterest,
  canonicalPlace,
  chapterRow,
  dbStatusFor,
  foldLabels,
  foldRows,
  hqStatus,
  internRow,
  parseRowId,
  startupRow,
} from "../lib/data/hq/normalise.ts";

const UUID = "0b8c5b8e-6a0e-4e55-9d59-2f3b1c9f0a11";

test("undecided rows are new until someone reads them", () => {
  assert.equal(hqStatus("applied", {}), "new");
  assert.equal(hqStatus("applied", { reviewer: "  " }), "new");
  assert.equal(hqStatus("applied", { reviewer: "Frank" }), "read");
  assert.equal(hqStatus("applied", { readAt: "2026-09-20T10:00:00Z" }), "read");
  assert.equal(hqStatus(null, {}), "new");
});

test("every table's decision words land on one vocabulary", () => {
  assert.equal(hqStatus("approved", {}), "accepted");
  assert.equal(hqStatus("Accepted", {}), "accepted");
  assert.equal(hqStatus("review", {}), "read");
  assert.equal(hqStatus("waitlist", {}), "waitlist");
  assert.equal(hqStatus("rejected", { reviewer: "Matthew" }), "rejected");
  assert.equal(hqStatus("withdrawn", {}), "withdrawn");
});

test("places fold aliases, case and spacing", () => {
  assert.equal(canonicalPlace(" bay  area "), "Bay Area");
  assert.equal(canonicalPlace("SF"), "Bay Area");
  assert.equal(canonicalPlace("Houston, TX"), "Houston");
  assert.equal(canonicalPlace("Remote"), "Online");
  assert.equal(canonicalPlace("Tulsa"), "Tulsa");
  assert.equal(canonicalPlace(""), null);
  assert.equal(canonicalPlace(null), null);
});

test("hand-typed labels fold to their most common spelling", () => {
  const map = foldLabels(["Lamar High School", "lamar high school", "Lamar High School", "Bellaire HS", null]);
  assert.equal(map.get("lamar high school"), "Lamar High School");
  assert.equal(map.get("Lamar High School"), "Lamar High School");
  assert.equal(map.get("Bellaire HS"), "Bellaire HS");
});

test("grades from both forms share one vocabulary", () => {
  assert.equal(canonicalGrade("11th grade"), "11th grade");
  assert.equal(canonicalGrade("11th"), "11th grade");
  assert.equal(canonicalGrade("College — Freshman"), "College freshman");
  assert.equal(canonicalGrade("College freshman"), "College freshman");
  assert.equal(canonicalGrade("College — Junior"), "College junior");
  assert.equal(canonicalGrade("College sophomore+"), "College sophomore+");
  assert.equal(canonicalGrade("Gap year"), "Gap year");
  assert.equal(canonicalGrade("8th"), "Other");
  assert.equal(canonicalGrade(""), null);
});

test("interests keep the contract's options and bucket the rest", () => {
  assert.equal(canonicalInterest("ai"), "AI");
  assert.equal(canonicalInterest("Computer Science"), "Computer Science");
  assert.equal(canonicalInterest("robotics"), "Other");
  assert.equal(canonicalInterest(null), null);
});

test("an intern row reads its reviewer and Sheet row", () => {
  const row = internRow({
    id: UUID,
    name: " Test  Applicant ",
    email: "test@example.com ",
    school: "Example High",
    grade: "10th grade",
    interest: "AI",
    chapter: "sf",
    startup_role: "Backend work",
    status: "applied",
    reviewer: "Frank",
    submitted_at: "2026-09-20T15:00:00Z",
    decided_at: null,
    sheet_row: { row: 642, decision: "", category: "" },
  });
  assert.equal(row.id, `intern:${UUID}`);
  assert.equal(row.name, "Test Applicant");
  assert.equal(row.email, "test@example.com");
  assert.equal(row.chapter, "Bay Area");
  assert.equal(row.status, "read");
  assert.equal(row.reviewer, "Frank");
  assert.equal(row.sheetRow, 642);
  assert.equal(row.decidedVia, null);
});

test("a startup row without 0020's status falls back to `handled`", () => {
  const base = { id: UUID, company: "Example Labs", name: "Demo", email: "d@example.com", role_interest: null, created_at: "2026-09-01T00:00:00Z" };
  assert.equal(startupRow({ ...base, handled: false }).status, "new");
  assert.equal(startupRow({ ...base, handled: true }).status, "read");
  assert.equal(startupRow({ ...base, status: "accepted" }).status, "accepted");
  assert.equal(startupRow(base).org, "Example Labs");
});

test("a chapter row maps review and approved", () => {
  const base = {
    id: UUID,
    name: "Sample Lead",
    email: "lead@example.com",
    school: "Demo Charter",
    grade: "11th",
    city: "online",
    why_axiom: "Start a chapter",
    submitted_at: "2026-09-01T00:00:00Z",
  };
  assert.equal(chapterRow({ ...base, status: "review" }).status, "read");
  assert.equal(chapterRow({ ...base, status: "approved" }).status, "accepted");
  assert.equal(chapterRow({ ...base, status: "applied" }).grade, "11th grade");
  assert.equal(chapterRow({ ...base, status: "applied" }).chapter, "Online");
});

test("school spellings fold across the whole set", () => {
  const make = (org: string) => ({ ...internRow({ id: UUID, name: "A", email: "a@example.com", school: org, grade: null, interest: null, chapter: null, startup_role: null, status: "applied", reviewer: null, submitted_at: "2026-09-01T00:00:00Z", decided_at: null }) });
  const rows = foldRows([make("Lamar HS"), make("lamar hs"), make("Lamar HS")]);
  assert.deepEqual(rows.map((row) => row.org), ["Lamar HS", "Lamar HS", "Lamar HS"]);
});

test("row ids round-trip and reject anything else", () => {
  assert.deepEqual(parseRowId(`chapter:${UUID}`), { side: "chapter", id: UUID });
  assert.equal(parseRowId(`admin:${UUID}`), null);
  assert.equal(parseRowId("intern:1; drop table"), null);
});

test("chapters can't be waitlisted: their table has no word for it", () => {
  assert.equal(dbStatusFor("chapter", "accepted"), "approved");
  assert.equal(dbStatusFor("chapter", "waitlist"), null);
  assert.equal(dbStatusFor("intern", "waitlist"), "waitlist");
});
