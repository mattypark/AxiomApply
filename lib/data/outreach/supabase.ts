import "server-only";

import { getAdminSupabase } from "@/lib/supabase/admin";
import type { HqActor } from "@/lib/data/hq/types";
import type { OutreachList, OutreachPatch, OutreachRow, OutreachSaved, OutreachStatus } from "./types";

/**
 * The outreach desk over Supabase, with the service-role client: the table
 * has RLS on and no policies, so this module plus HQ's gate is the only way
 * in. `server-only`, and every caller sits behind hqRoute().
 *
 * The list sends light rows (no bios, descriptions or alternate addresses)
 * so 700+ companies stay well under a serverless response limit; the drawer
 * asks for one full row at a time.
 */

const TABLE = "yc_outreach";

type Json = Record<string, unknown>;

interface DbRow {
  slug: string;
  company: Json;
  draft: Json | null;
  funding: Json | null;
  status: OutreachStatus;
  note: string;
  contact: string | null;
  updated_at: string | null;
  updated_by: string | null;
  imported_at: string | null;
}

/** PostgREST's "no such table" (migration 0021 not applied yet). */
function isMissingTable(error: { code?: string; message?: string }): boolean {
  return error.code === "PGRST205" || error.code === "42P01" || /could not find the table/i.test(error.message ?? "");
}

const pick = <T extends Json>(source: T | null | undefined, keys: readonly string[]): Json =>
  Object.fromEntries(keys.filter((key) => source && key in source).map((key) => [key, (source as Json)[key]]));

const LIGHT_COMPANY = ["name", "batch", "batchShort", "website", "domain", "oneLiner", "industry", "locations", "teamSize", "ycUrl", "logoUrl", "links", "best", "internJobs"] as const;
const LIGHT_FOUNDER = ["name", "title", "linkedin", "x", "email", "emailSource"] as const;
const LIGHT_DRAFT = ["to", "subject", "body", "hook", "style", "closer"] as const;
const LIGHT_FUNDING = ["status", "amountUsd", "amountLabel", "round"] as const;

function toRow(db: DbRow, full: boolean): OutreachRow {
  const company = db.company ?? {};
  const founders = Array.isArray(company.founders) ? (company.founders as Json[]) : [];
  const jobs = Array.isArray(company.jobs) ? company.jobs : [];
  return {
    slug: db.slug,
    company: {
      ...(full ? company : pick(company, LIGHT_COMPANY)),
      founders: full ? founders : founders.map((founder) => pick(founder, LIGHT_FOUNDER)),
      jobCount: jobs.length,
    } as unknown as OutreachRow["company"],
    draft: db.draft ? ((full ? db.draft : pick(db.draft, LIGHT_DRAFT)) as unknown as OutreachRow["draft"]) : null,
    funding: db.funding ? ((full ? db.funding : pick(db.funding, LIGHT_FUNDING)) as unknown as OutreachRow["funding"]) : null,
    status: db.status,
    note: db.note ?? "",
    contact: db.contact,
    updatedAt: db.updated_at,
    updatedBy: db.updated_by,
  };
}

const COLUMNS = "slug, company, draft, funding, status, note, contact, updated_at, updated_by, imported_at";

export interface OutreachSource {
  list(): Promise<OutreachList>;
  get(slug: string): Promise<OutreachRow | null>;
  update(slugs: string[], patch: OutreachPatch, actor: HqActor): Promise<OutreachSaved>;
}

export function supabaseOutreachSource(): OutreachSource {
  return {
    async list() {
      const db = getAdminSupabase();
      if (!db) return { ok: false, reason: "not-configured" };
      const { data, error } = await db.from(TABLE).select(COLUMNS).order("slug").limit(5000);
      if (error) {
        if (isMissingTable(error)) return { ok: false, reason: "not-imported" };
        throw new Error(`outreach list: ${error.message}`);
      }
      const rows = (data ?? []) as DbRow[];
      if (rows.length === 0) return { ok: false, reason: "not-imported" };
      const importedAt = rows.reduce<string | null>((latest, row) => (!latest || (row.imported_at ?? "") > latest ? row.imported_at : latest), null);
      return { ok: true, rows: rows.map((row) => toRow(row, false)), importedAt };
    },

    async get(slug) {
      const db = getAdminSupabase();
      if (!db) return null;
      const { data, error } = await db.from(TABLE).select(COLUMNS).eq("slug", slug).maybeSingle();
      if (error) {
        if (isMissingTable(error)) return null;
        throw new Error(`outreach get: ${error.message}`);
      }
      return data ? toRow(data as DbRow, true) : null;
    },

    async update(slugs, patch, actor) {
      const db = getAdminSupabase();
      if (!db) return { ok: false, error: "The database isn't configured." };
      const { data, error } = await db
        .from(TABLE)
        .update({ ...patch, updated_at: new Date().toISOString(), updated_by: actor.email })
        .in("slug", slugs)
        .select("slug, status, note, contact, updated_at, updated_by");
      if (error) {
        console.error("outreach update failed:", error.message);
        return { ok: false, error: "That didn't save. Try again." };
      }
      return {
        ok: true,
        rows: (data ?? []).map((row) => ({
          slug: row.slug as string,
          status: row.status as OutreachStatus,
          note: (row.note as string) ?? "",
          contact: (row.contact as string | null) ?? null,
          updatedAt: row.updated_at as string | null,
          updatedBy: row.updated_by as string | null,
        })),
      };
    },
  };
}
