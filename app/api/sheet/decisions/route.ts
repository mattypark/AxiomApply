import { NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { parseSheetRows, type SheetRow } from "@/lib/sheet-decisions";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Where Sheet decisions land.
 *
 * Called by the "Push decisions to site" menu item in the Sheet
 * (APPS_SCRIPT_DECISIONS.gs), never on a schedule — Matthew decides when
 * review work is finished. Writing here mails nobody: it updates
 * `applications.status` and stops, and the queue on /admin/applications is
 * built and sent by two further, separate human clicks.
 *
 * Auth is a shared secret in a header rather than the Bearer scheme used by
 * /api/cron/refresh, because that one is Vercel's own convention and this
 * caller is Apps Script.
 */
export async function POST(request: Request) {
  const secret = process.env.SHEET_PUSH_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "SHEET_PUSH_SECRET not configured" }, { status: 503 });
  }
  if (request.headers.get("x-axiom-secret") !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = getAdminSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase service role not configured" }, { status: 503 });
  }

  let body: { rows?: SheetRow[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }
  if (!Array.isArray(body.rows)) {
    return NextResponse.json({ error: "rows must be an array" }, { status: 400 });
  }

  const parsed = parseSheetRows(body.rows);

  // Existing rows are matched in memory rather than with 666 round trips. The
  // whole table is read because the match has to be case-insensitive: the
  // Sheet's addresses are lowercased here, while rows written by the web form
  // carry whatever the applicant typed. Filtering server-side with `.in()`
  // would compare exactly, miss `Foo@x.com`, and quietly insert a second row
  // for someone who already exists — the unique index is on
  // (lower(email), submitted_at), so a duplicate with a different timestamp
  // raises no error at all.
  const known = new Map<string, { id: string; status: string }>();
  const PAGE = 1000;

  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from("applications")
      .select("id, email, status, submitted_at")
      .order("submitted_at", { ascending: false })
      .range(from, from + PAGE - 1);

    if (error) {
      return NextResponse.json({ error: `lookup failed: ${error.message}` }, { status: 500 });
    }
    for (const row of data ?? []) {
      const key = String(row.email).toLowerCase();
      // Ordered newest first, so the first row seen for an address is the one
      // a status change should land on — it is also the one the applicant's
      // own UI reads (lib/applications.ts takes the latest).
      if (!known.has(key)) {
        known.set(key, { id: row.id as string, status: row.status as string });
      }
    }
    if (!data || data.length < PAGE) break;
  }

  const decidedAt = new Date().toISOString();
  const inserts: Record<string, unknown>[] = [];
  let updated = 0;
  const failures: { email: string; error: string }[] = [];

  for (const person of parsed.people) {
    const existing = known.get(person.email);

    if (!existing) {
      inserts.push({
        email: person.email,
        name: person.name,
        status: person.status,
        reviewer: person.reviewer,
        selected_for: person.category,
        decided_at: person.undecided ? null : decidedAt,
        source: "sheet_backfill",
        submitted_at: person.submittedAt ?? decidedAt,
        sheet_row: { row: person.row, decision: person.status, category: person.category },
      });
      continue;
    }

    // Nothing to write when the Sheet agrees with Postgres. Skipping the
    // no-ops keeps a re-push cheap and leaves decided_at meaning "when this
    // decision was first recorded" rather than "last time anyone pushed".
    if (existing.status === person.status) continue;

    const { error } = await supabase
      .from("applications")
      .update({
        status: person.status,
        reviewer: person.reviewer,
        selected_for: person.category,
        decided_at: person.undecided ? null : decidedAt,
      })
      .eq("id", existing.id);

    if (error) failures.push({ email: person.email, error: error.message });
    else updated += 1;
  }

  let inserted = 0;
  for (let i = 0; i < inserts.length; i += 200) {
    const batch = inserts.slice(i, i + 200);
    const { error } = await supabase.from("applications").insert(batch);
    if (error) failures.push({ email: `${batch.length} rows`, error: error.message });
    else inserted += batch.length;
  }

  const counts = parsed.people.reduce<Record<string, number>>((acc, p) => {
    acc[p.status] = (acc[p.status] ?? 0) + 1;
    return acc;
  }, {});

  return NextResponse.json(
    {
      received: parsed.received,
      upserted: inserted + updated,
      inserted,
      updated,
      unchanged: parsed.people.length - inserted - updated - failures.length,
      duplicatesCollapsed: parsed.duplicatesCollapsed,
      counts,
      skipped: parsed.skipped,
      failures,
    },
    { status: failures.length ? 207 : 200 },
  );
}
