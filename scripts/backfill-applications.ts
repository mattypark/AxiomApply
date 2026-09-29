/**
 * Backfill `applications` from a CSV export of the interns Sheet.
 *
 *   1. In the Sheet: open the `Applications` tab → File → Download →
 *      Comma-separated values. Save it as private/applications.csv
 *      (private/ is gitignored: it holds applicants' personal details).
 *   2. Dry run (the default; writes nothing):
 *        node --env-file=.env.local scripts/backfill-applications.ts private/applications.csv
 *   3. If the shape check and the counts look right:
 *        node --env-file=.env.local scripts/backfill-applications.ts private/applications.csv --write
 *
 * Flags:
 *   --tz <zone>   the Sheet's time zone (File → Settings). Default America/Chicago.
 *   --sheet-only  parse and count the CSV without touching the database.
 *   --write       apply the plan. Refused when the shape check fails.
 *
 * What it prints is counts and Sheet row numbers only, never a name, an
 * address or an answer, so the output is safe to paste anywhere.
 *
 * What it writes (only with --write):
 *   · blank answer columns on rows the database already has; never
 *     overwrites a value, never touches status, reviewer or the contacted flag;
 *   · one new row per person the database has never seen, exactly as the
 *     Sheet push would have written them (lib/sheet-backfill.ts, insertRow).
 * Re-running it is safe: a second run finds nothing left to fill.
 */

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { collapsePeople, insertRow, parseCsv, planBackfill, readSheet, type DbApplication } from "../lib/sheet-backfill.ts";
import { ANSWER_COLUMNS, SHEET_TIME_ZONE } from "../lib/sheet-shared.ts";

/** Below these, the columns aren't where the script thinks they are. */
const SHAPE_FLOOR = { emailInC: 95, timestampInA: 95, gradeLikeInF: 80 };

const args = process.argv.slice(2);
const csvPath = args.find((arg) => !arg.startsWith("--") && args[args.indexOf(arg) - 1] !== "--tz");
const write = args.includes("--write");
const sheetOnly = args.includes("--sheet-only");
const tzIndex = args.indexOf("--tz");
const timeZone = tzIndex >= 0 ? args[tzIndex + 1] : SHEET_TIME_ZONE;

function fail(message: string): never {
  console.error(`\n✗ ${message}\n`);
  process.exit(1);
}

if (!csvPath) fail("Pass the CSV path, e.g. private/applications.csv");

// 1. The Sheet ------------------------------------------------------------------------

const table = parseCsv(readFileSync(csvPath, "utf8"));
const { applications, skipped, unreadable, shape } = readSheet(table, timeZone);
const { people, collapsed } = collapsePeople(applications, unreadable);

console.log(`\nSheet (${timeZone})`);
console.log(`  data rows                 ${shape.dataRows}`);
console.log(`  readable rows             ${applications.length}`);
console.log(`  people (one row each)     ${people.length}   (${collapsed} extra submissions folded in)`);
console.log(`  skipped rows              ${skipped.length}`);
const reasons = new Map<string, number[]>();
for (const skip of skipped) reasons.set(skip.why, [...(reasons.get(skip.why) ?? []), skip.row]);
for (const [why, rows] of reasons) console.log(`    ${why}: rows ${rows.join(", ")}`);
if (unreadable.size) console.log(`  people held back          ${unreadable.size}   (an unreadable column Y on one of their rows — fix it in the Sheet)`);

console.log(`\nShape check (% of data rows)`);
const shapeOk =
  shape.emailInC >= SHAPE_FLOOR.emailInC && shape.timestampInA >= SHAPE_FLOOR.timestampInA && shape.gradeLikeInF >= SHAPE_FLOOR.gradeLikeInF;
console.log(`  C is an email             ${shape.emailInC}%   (want ≥ ${SHAPE_FLOOR.emailInC})`);
console.log(`  A is a timestamp          ${shape.timestampInA}%   (want ≥ ${SHAPE_FLOOR.timestampInA})`);
console.log(`  F looks like a grade      ${shape.gradeLikeInF}%   (want ≥ ${SHAPE_FLOOR.gradeLikeInF})`);
console.log(`  L says "Applied"          ${shape.appliedInL}%   (the webhook's marker; older rows may predate it)`);
console.log(`  Y is a decision or blank  ${shape.decisionReadableInY}%`);
console.log(`  → ${shapeOk ? "columns are where they should be" : "COLUMNS HAVE MOVED — nothing will be written"}`);

if (sheetOnly) process.exit(0);

// 2. The database ---------------------------------------------------------------------------

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) fail("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set (run with --env-file=.env.local).");

const db = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

async function readApplications(): Promise<DbApplication[]> {
  const rows: DbApplication[] = [];
  const columns = `id, email, name, submitted_at, ${ANSWER_COLUMNS.join(", ")}`;
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db.from("applications").select(columns).order("submitted_at").range(from, from + 999);
    if (error) fail(`Couldn't read applications: ${error.message}`);
    rows.push(...((data ?? []) as unknown as DbApplication[]));
    if (!data || data.length < 1000) return rows;
  }
}

async function count(table: string): Promise<number | string> {
  const { count: total, error } = await db.from(table).select("id", { count: "exact", head: true });
  return error ? `unreadable (${error.message})` : (total ?? 0);
}

const existing = await readApplications();
const plan = planBackfill(people, existing);
const distinctDb = new Set(existing.map((row) => row.email.trim().toLowerCase())).size;

console.log(`\nDatabase (applications)`);
console.log(`  rows                      ${existing.length}   (${distinctDb} distinct addresses)`);
console.log(`  people matched            ${plan.matched}`);
console.log(`  rows gaining answers      ${plan.fills.length}`);
console.log(`  people to insert          ${plan.inserts.length}`);
console.log(`  addresses not in Sheet    ${plan.dbOnly}   (web-only, or no longer in the Sheet)`);
const columnFills = new Map<string, number>();
for (const fill of plan.fills) for (const column of Object.keys(fill.fields)) columnFills.set(column, (columnFills.get(column) ?? 0) + 1);
if (columnFills.size) {
  console.log(`  blanks filled, by column  ${[...columnFills].map(([column, n]) => `${column} ${n}`).join(" · ")}`);
}
console.log(`\nAfter this run: ${distinctDb + plan.inserts.length} people in applications vs ${people.length} in the Sheet.`);
console.log(`Other sides (compare with their own Sheets): startup_inquiries ${await count("startup_inquiries")} · chapter_applications ${await count("chapter_applications")}`);

if (!write) {
  console.log(`\nDry run: nothing was written. Add --write to apply.\n`);
  process.exit(0);
}
if (!shapeOk) fail("Refusing to write: the shape check failed. The Sheet's columns aren't where this script expects them.");

// 3. Writing ---------------------------------------------------------------------------------

let filled = 0;
let inserted = 0;
const failures: string[] = [];

for (const fill of plan.fills) {
  const { error } = await db.from("applications").update(fill.fields).eq("id", fill.id);
  if (error) failures.push(`fill ${fill.id}: ${error.message}`);
  else filled += 1;
}

const rows = plan.inserts.map(insertRow);
for (let i = 0; i < rows.length; i += 200) {
  const batch = rows.slice(i, i + 200);
  const { error } = await db.from("applications").insert(batch);
  if (error) failures.push(`insert batch at ${i}: ${error.message}`);
  else inserted += batch.length;
}

console.log(`\nWritten: ${filled} rows filled, ${inserted} people inserted, ${failures.length} failures.`);
for (const failure of failures) console.log(`  ${failure}`);
console.log(`Run it again without --write: it should find nothing left to do.\n`);
process.exit(failures.length ? 1 : 0);
