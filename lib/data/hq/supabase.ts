import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { QUESTION_SETS } from "@/lib/apply-sections";
import { dayKey, listPage, stats, toCsv, applyFilters } from "./aggregate";
import {
  GRADE_ORDER,
  chapterRow,
  dbStatusFor,
  foldRows,
  internRow,
  parseRowId,
  startupRow,
  type ChapterRecord,
  type InternRecord,
  type StartupRecord,
} from "./normalise";
import type { HqActor, HqAnswer, HqDetail, HqRow, HqSource, Ok, Side } from "./types";

/**
 * HQ over Supabase, with the service-role client.
 *
 * Service role because HQ reads every applicant, and RLS only lets people
 * read their own row. That makes this module the lock's other half: it is
 * `server-only`, and every caller sits behind `gateHq()` (lib/hq-gate.ts).
 *
 * Counting happens here, in Node, over light rows: at a few thousand
 * applications that is quicker to build and just as fast as SQL GROUP BYs
 * through PostgREST, and the browser still only ever receives the counts and
 * one page of the list. The D1 adapter can push the counting into SQL
 * behind the same signatures.
 *
 * Works before and after 0020_hq.sql: a missing column means "read the old
 * columns and say so", never a blank page.
 */

type Table = "applications" | "startup_inquiries" | "chapter_applications";

const TABLE: Record<Side, Table> = {
  intern: "applications",
  startup: "startup_inquiries",
  chapter: "chapter_applications",
};

/** Light columns: what the list and the charts need. No phone numbers. */
const COLUMNS: Record<Side, { base: string; hq: string; order: string }> = {
  intern: {
    base: "id, name, email, school, grade, interest, chapter, startup_role, status, reviewer, submitted_at, decided_at, sheet_row",
    hq: ", read_at, read_by, decided_via",
    order: "submitted_at",
  },
  startup: {
    base: "id, company, name, email, role_interest, created_at, handled",
    hq: ", status, read_at, read_by, decided_at",
    order: "created_at",
  },
  chapter: {
    base: "id, name, email, school, grade, city, why_axiom, status, submitted_at",
    hq: ", read_at, read_by, decided_at, decided_via",
    order: "submitted_at",
  },
};

const PAGE = 1000;
const MIGRATION_HINT = "Run supabase/migrations/0020_hq.sql first — the database can't record that yet.";

/** Postgres "undefined_column". PostgREST passes the code through. */
function isMissingColumn(error: { code?: string; message?: string } | null): boolean {
  return Boolean(error && (error.code === "42703" || /column .* does not exist/i.test(error.message ?? "")));
}

async function readAll<T>(db: SupabaseClient, side: Side, columns: string): Promise<{ data: T[] } | { error: { code?: string; message?: string } }> {
  const data: T[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data: page, error } = await db
      .from(TABLE[side])
      .select(columns)
      .order(COLUMNS[side].order, { ascending: false })
      .range(from, from + PAGE - 1);
    if (error) return { error };
    data.push(...((page ?? []) as T[]));
    if (!page || page.length < PAGE) return { data };
  }
}

type Loaded = { rows: HqRow[]; missing: Side[]; needsMigration: boolean };

async function loadRows(db: SupabaseClient): Promise<Loaded> {
  const missing: Side[] = [];
  let needsMigration = false;

  const load = async (side: Side): Promise<HqRow[]> => {
    let result = await readAll<Record<string, unknown>>(db, side, COLUMNS[side].base + COLUMNS[side].hq);
    if ("error" in result && isMissingColumn(result.error)) {
      needsMigration = true;
      result = await readAll<Record<string, unknown>>(db, side, COLUMNS[side].base);
    }
    if ("error" in result) {
      console.error(`HQ: couldn't read ${TABLE[side]}: ${result.error.message ?? result.error.code}`);
      missing.push(side);
      return [];
    }
    if (side === "intern") return result.data.map((record) => internRow(record as InternRecord));
    if (side === "startup") return result.data.map((record) => startupRow(record as StartupRecord));
    return result.data.map((record) => chapterRow(record as ChapterRecord));
  };

  const [interns, startups, chapters] = await Promise.all([load("intern"), load("startup"), load("chapter")]);
  return { rows: foldRows([...interns, ...startups, ...chapters]), missing, needsMigration };
}

function today(): string {
  return dayKey(new Date().toISOString());
}

// Answers ---------------------------------------------------------------------------

/** Shown under Contact instead, and only after "Show". */
const CONTACT_IDS = new Set(["name", "email", "phone", "contact_name", "contact_email"]);

/** Intern file questions are stored as links under a different column name. */
const COLUMN_FOR: Record<string, string> = { resume: "resume_url", extra_file: "extra_file_url" };

/** A startup's answers live as "key: value" lines in `message` (lib/actions/applications.ts). */
function parseTranscript(message: unknown): Record<string, string> {
  const values: Record<string, string> = {};
  let key: string | null = null;
  for (const line of String(message ?? "").split("\n")) {
    const match = line.match(/^([a-z_]+): (.*)$/);
    if (match) {
      key = match[1];
      values[key] = match[2];
    } else if (key) {
      values[key] += `\n${line}`;
    }
  }
  return values;
}

/** Non-empty strings only, so a blank column never hides the same answer kept elsewhere. */
function filled(source: unknown): Record<string, string> {
  if (!source || typeof source !== "object") return {};
  return Object.fromEntries(
    Object.entries(source as Record<string, unknown>).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string" && entry[1].trim() !== "",
    ),
  );
}

function answersFor(side: Side, record: Record<string, unknown>): HqAnswer[] {
  // `sheet_row` keeps everything a web submission sent (interns) or every
  // answer the table has no column for (chapters). Columns win when both
  // have a value; either fills in for the other when one is blank.
  const values: Record<string, unknown> =
    side === "startup" ? parseTranscript(record.message) : { ...filled(record.sheet_row), ...filled(record) };
  const answers: HqAnswer[] = [];
  for (const section of QUESTION_SETS[side].sections) {
    for (const question of section.questions) {
      if (CONTACT_IDS.has(question.id)) continue;
      const value = values[COLUMN_FOR[question.id] ?? question.id];
      if (typeof value === "string" && value.trim()) answers.push({ label: question.label, value: value.trim() });
    }
  }
  return answers;
}

// The source ---------------------------------------------------------------------------

async function audit(db: SupabaseClient, by: HqActor, action: "reveal" | "export" | "decide" | "mark_read", ids: string[], detail?: unknown) {
  const { error } = await db.from("hq_audit").insert({ actor_email: by.email, action, target_ids: ids, detail: detail ?? null });
  // A missing log must be loud: the whole point of it is a record.
  if (error) console.error(`HQ audit write failed (${action}): ${error.message}`);
  return !error;
}

function unavailable(): never {
  throw new Error("Supabase service role is not configured");
}

export function supabaseHqSource(): HqSource {
  const db = getAdminSupabase() ?? unavailable();

  return {
    async stats(filters) {
      const { rows, missing, needsMigration } = await loadRows(db);
      return stats(rows, filters, today(), GRADE_ORDER, { missing, needsMigration });
    },

    async list(filters, page) {
      const { rows } = await loadRows(db);
      return listPage(rows, filters, today(), page);
    },

    async get(id) {
      const target = parseRowId(id);
      if (!target) return null;
      const { data, error } = await db.from(TABLE[target.side]).select("*").eq("id", target.id).maybeSingle();
      if (error || !data) return null;
      const record = data as Record<string, unknown>;
      const row =
        target.side === "intern"
          ? internRow(record as InternRecord)
          : target.side === "startup"
            ? startupRow(record as StartupRecord)
            : chapterRow(record as ChapterRecord);
      const detail: HqDetail = {
        ...row,
        answers: answersFor(target.side, record),
        sheetDecision: typeof record.sheet_decision === "string" ? record.sheet_decision : null,
        decidedBy: typeof record.decided_by === "string" ? record.decided_by : null,
      };
      return detail;
    },

    async contact(id, by) {
      const target = parseRowId(id);
      if (!target) return null;
      const columns = target.side === "startup" ? "email" : "email, phone";
      const { data, error } = await db.from(TABLE[target.side]).select(columns).eq("id", target.id).maybeSingle();
      if (error || !data) return null;
      // No record, no reveal.
      if (!(await audit(db, by, "reveal", [id]))) return null;
      const record = data as unknown as { email: string; phone?: string | null };
      return { email: record.email, phone: record.phone ?? null };
    },

    async decide(id, decision, by): Promise<Ok> {
      const target = parseRowId(id);
      if (!target) return { ok: false, error: "Unknown application." };
      const status = dbStatusFor(target.side, decision);
      if (!status) return { ok: false, error: "Chapters are approved or turned down — there's no waitlist for them." };

      const now = new Date().toISOString();
      const fields: Record<string, string> = { status, decided_at: now, decided_by: by.name };
      if (target.side !== "startup") fields.decided_via = "hq";

      const { error } = await db.from(TABLE[target.side]).update(fields).eq("id", target.id);
      if (error) return { ok: false, error: isMissingColumn(error) ? MIGRATION_HINT : "That didn't save. Try again." };

      // Deciding means someone read it; stamp the read if nobody had.
      await db.from(TABLE[target.side]).update({ read_at: now, read_by: by.name }).eq("id", target.id).is("read_at", null);
      await audit(db, by, "decide", [id], { status });
      return { ok: true };
    },

    async markRead(id, by): Promise<Ok> {
      const target = parseRowId(id);
      if (!target) return { ok: false, error: "Unknown application." };
      const { error } = await db
        .from(TABLE[target.side])
        .update({ read_at: new Date().toISOString(), read_by: by.name })
        .eq("id", target.id)
        .is("read_at", null);
      if (error) return { ok: false, error: isMissingColumn(error) ? MIGRATION_HINT : "That didn't save. Try again." };
      await audit(db, by, "mark_read", [id]);
      return { ok: true };
    },

    async exportCsv(filters, by) {
      const { rows } = await loadRows(db);
      const slice = applyFilters(rows, filters, today());
      const phones = await phonesFor(db, slice);
      // Logged before the file leaves: an export nobody recorded is the failure to avoid.
      if (!(await audit(db, by, "export", slice.map((row) => row.id), { filters, count: slice.length }))) {
        throw new Error("Export not logged");
      }
      return toCsv(slice.map((row) => ({ ...row, phone: phones.get(row.id) ?? null })));
    },
  };
}

/** Phone numbers for an export, fetched only then. Startups have none. */
async function phonesFor(db: SupabaseClient, rows: readonly HqRow[]): Promise<Map<string, string>> {
  const phones = new Map<string, string>();
  for (const side of ["intern", "chapter"] as const) {
    const ids = rows.filter((row) => row.side === side).map((row) => row.id.slice(side.length + 1));
    for (let i = 0; i < ids.length; i += 200) {
      const { data, error } = await db.from(TABLE[side]).select("id, phone").in("id", ids.slice(i, i + 200));
      if (error) throw new Error(`Couldn't read phone numbers: ${error.message}`);
      for (const record of (data ?? []) as { id: string; phone: string | null }[]) {
        if (record.phone) phones.set(`${side}:${record.id}`, record.phone);
      }
    }
  }
  return phones;
}
