import "server-only";

import { getAdminSupabase } from "@/lib/supabase/admin";
import type { Source } from "@/types/database";
import type { RawInternship, SourceAdapter, SourceRunResult } from "./types";
import { simplifyGithubAdapter } from "./adapters/simplify-github";
import { interndockAdapter } from "./adapters/interndock";
import { genericJsonAdapter } from "./adapters/generic-json";

const ADAPTERS: Record<string, SourceAdapter> = {
  [simplifyGithubAdapter.key]: simplifyGithubAdapter,
  [interndockAdapter.key]: interndockAdapter,
  [genericJsonAdapter.key]: genericJsonAdapter,
};

const UPSERT_CHUNK = 500;

/**
 * Run ingestion for all active sources (or one, if sourceId given).
 * Per-source isolation: one broken source never kills the run.
 * Yield alarm: >50% drop vs the last run is flagged as "partial".
 */
export async function runIngestion(sourceId?: string): Promise<SourceRunResult[]> {
  const supabase = getAdminSupabase();
  if (!supabase) {
    return [
      {
        sourceId: "-",
        name: "supabase",
        status: "error",
        count: 0,
        error: "Supabase service role not configured",
      },
    ];
  }

  let query = supabase.from("sources").select("*").eq("active", true);
  if (sourceId) query = query.eq("id", sourceId);
  const { data: sources, error } = await query;
  if (error) throw new Error(`sources query failed: ${error.message}`);

  const results: SourceRunResult[] = [];

  for (const source of (sources ?? []) as Source[]) {
    const adapter = ADAPTERS[source.adapter];
    if (!adapter) {
      results.push({
        sourceId: source.id,
        name: source.name,
        status: "error",
        count: 0,
        error: `unknown adapter "${source.adapter}"`,
      });
      continue;
    }

    let status: SourceRunResult["status"] = "ok";
    let count = 0;
    let errMsg: string | undefined;

    try {
      const raw = await adapter.fetchListings(source);
      const rows = normalize(raw, source.id);
      count = rows.length;

      for (let i = 0; i < rows.length; i += UPSERT_CHUNK) {
        const chunk = rows.slice(i, i + UPSERT_CHUNK);
        const { error: upErr } = await supabase
          .from("internships")
          .upsert(chunk, { onConflict: "dedupe_key" });
        if (upErr) throw new Error(`upsert failed: ${upErr.message}`);
      }

      // Yield alarm: big drop vs last run usually means the page changed.
      if (
        source.last_count != null &&
        source.last_count > 10 &&
        count < source.last_count * 0.5
      ) {
        status = "partial";
        errMsg = `yield drop: ${count} vs ${source.last_count} last run`;
      }
    } catch (e) {
      status = "error";
      errMsg = e instanceof Error ? e.message : String(e);
    }

    await supabase
      .from("sources")
      .update({
        last_run_at: new Date().toISOString(),
        last_status: errMsg ? `${status}: ${errMsg}` : status,
        last_count: count,
      })
      .eq("id", source.id);

    results.push({
      sourceId: source.id,
      name: source.name,
      status,
      count,
      error: errMsg,
    });
  }

  return results;
}

/** Trim, dedupe within the batch, map to DB columns. */
function normalize(raw: RawInternship[], sourceId: string) {
  const seen = new Set<string>();
  const rows: Record<string, unknown>[] = [];
  const now = new Date().toISOString();

  for (const r of raw) {
    const company = r.company.trim();
    const role = r.role.trim();
    if (!company || !role) continue;

    const key = `${company.toLowerCase()}|${role.toLowerCase()}|${r.season}|${r.year ?? ""}`;
    if (seen.has(key)) continue;
    seen.add(key);

    rows.push({
      source_id: sourceId,
      company,
      role,
      season: r.season,
      year: r.year ?? null,
      locations: r.locations ?? [],
      url: r.url ?? null,
      sponsorship: r.sponsorship ?? null,
      categories: r.categories ?? [],
      is_open: r.isOpen ?? true,
      last_seen_at: now,
    });
  }
  return rows;
}
