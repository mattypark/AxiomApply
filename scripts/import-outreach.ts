/**
 * Load the YC outreach bundle into `yc_outreach` for HQ's outreach desk.
 *
 *   1. In axiom-yc-outreach: `npm run bundle` → out/hq-bundle.json.
 *      Copy it to private/outreach/hq-bundle.json here (private/ is
 *      gitignored: it holds founders' names and addresses).
 *   2. Apply supabase/migrations/0021_yc_outreach.sql once.
 *   3. Dry run (the default; writes nothing):
 *        node --env-file=.env.local scripts/import-outreach.ts private/outreach/hq-bundle.json
 *   4. If the counts look right:
 *        node --env-file=.env.local scripts/import-outreach.ts private/outreach/hq-bundle.json --write
 *
 * What it writes (only with --write):
 *   · new companies: everything, including the status and note from the bundle;
 *   · companies already in the table: company, draft and funding only. Status,
 *     note and the send-to address are HQ's once a row exists, and an import
 *     never overwrites what someone decided there.
 * Re-running it is safe. Output is counts only, never a name or an address.
 */

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const STATUSES = new Set(["new", "shortlist", "drafted", "approved", "sent", "replied", "call", "pass"]);
const CHUNK = 100;

interface BundleRow {
  slug: string;
  company: Record<string, unknown>;
  draft: Record<string, unknown> | null;
  funding: Record<string, unknown> | null;
  status: string;
  note: string;
  contact: string | null;
}

function fail(message: string): never {
  console.error(`\n✗ ${message}\n`);
  process.exit(1);
}

const args = process.argv.slice(2);
const path = args.find((arg) => !arg.startsWith("--"));
const write = args.includes("--write");
if (!path) fail("Pass the bundle path, e.g. private/outreach/hq-bundle.json");

const bundle = JSON.parse(readFileSync(path, "utf8")) as { builtAt?: string; rows?: BundleRow[] };
const rows = bundle.rows ?? [];
const bad = rows.filter((row) => !/^[a-z0-9-]{1,120}$/.test(row.slug ?? "") || !row.company || !STATUSES.has(row.status));
if (!rows.length) fail("The bundle has no rows.");
if (bad.length) fail(`${bad.length} rows have a bad slug, company or status. Rebuild the bundle.`);

console.log(`\nBundle (built ${bundle.builtAt ?? "unknown"})`);
console.log(`  companies        ${rows.length}`);
console.log(`  with a draft     ${rows.filter((row) => row.draft).length}`);
console.log(`  with funding     ${rows.filter((row) => row.funding?.status === "announced").length} announced`);

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
if (!url || !key) fail("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set (run with --env-file=.env.local).");
const db = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

const existing = new Set<string>();
for (let from = 0; ; from += 1000) {
  const { data, error } = await db.from("yc_outreach").select("slug").range(from, from + 999);
  if (error) fail(`Can't read yc_outreach (${error.message}). Apply 0021_yc_outreach.sql first.`);
  for (const row of data ?? []) existing.add(row.slug as string);
  if (!data || data.length < 1000) break;
}

const fresh = rows.filter((row) => !existing.has(row.slug));
const known = rows.filter((row) => existing.has(row.slug));
console.log(`\nPlan`);
console.log(`  insert new       ${fresh.length}`);
console.log(`  refresh content  ${known.length}  (status, note and send-to address untouched)`);

if (!write) {
  console.log(`\nDry run. Nothing written. Add --write to apply.\n`);
  process.exit(0);
}

const now = new Date().toISOString();
for (let i = 0; i < fresh.length; i += CHUNK) {
  const chunk = fresh.slice(i, i + CHUNK).map((row) => ({
    slug: row.slug,
    company: row.company,
    draft: row.draft,
    funding: row.funding,
    status: row.status,
    note: (row.note ?? "").slice(0, 4000),
    contact: row.contact,
    imported_at: now,
  }));
  const { error } = await db.from("yc_outreach").insert(chunk);
  if (error) fail(`Insert failed at row ${i}: ${error.message}`);
}

for (const row of known) {
  const { error } = await db
    .from("yc_outreach")
    .update({ company: row.company, draft: row.draft, funding: row.funding, imported_at: now })
    .eq("slug", row.slug);
  if (error) fail(`Refresh failed for a row: ${error.message}`);
}

console.log(`\n✓ Inserted ${fresh.length}, refreshed ${known.length}.\n`);
