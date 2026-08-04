import type { Source } from "@/types/database";
import { clean, type RawInternship, type SourceAdapter } from "../types";

/**
 * Zero-code adapter for any JSON feed Matthew finds later.
 *
 * config: {
 *   listPath?: "data.items",       // dot-path to the array (default: root)
 *   fields: {                      // dot-paths within each item
 *     company: "company", role: "title",
 *     url?: "link", locations?: "locations", sponsorship?: "sponsorship"
 *   },
 *   season: "summer", year?: 2027
 * }
 */

function dig(obj: unknown, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>(
      (o, k) => (o && typeof o === "object" ? (o as Record<string, unknown>)[k] : undefined),
      obj,
    );
}

export const genericJsonAdapter: SourceAdapter = {
  key: "generic_json",

  async fetchListings(source: Source): Promise<RawInternship[]> {
    const cfg = source.config as {
      listPath?: string;
      fields?: Record<string, string>;
      season?: RawInternship["season"];
      year?: number;
    };
    if (!cfg.season) throw new Error("generic_json: config.season required");
    const fields = cfg.fields ?? { company: "company", role: "role" };

    const res = await fetch(source.url, { cache: "no-store" });
    if (!res.ok) throw new Error(`generic_json: ${source.url} → ${res.status}`);
    const json = (await res.json()) as unknown;

    const listRaw = cfg.listPath ? dig(json, cfg.listPath) : json;
    if (!Array.isArray(listRaw)) throw new Error("generic_json: list path is not an array");

    const out: RawInternship[] = [];
    for (const item of listRaw) {
      const company = dig(item, fields.company);
      const role = dig(item, fields.role);
      if (typeof company !== "string" || typeof role !== "string") continue;
      const url = fields.url ? dig(item, fields.url) : undefined;
      const locations = fields.locations ? dig(item, fields.locations) : undefined;
      const sponsorship = fields.sponsorship ? dig(item, fields.sponsorship) : undefined;

      out.push({
        company: clean(company),
        role: clean(role),
        season: cfg.season,
        year: cfg.year,
        url: typeof url === "string" ? url : undefined,
        locations: Array.isArray(locations) ? locations.map(String).map(clean) : undefined,
        sponsorship: typeof sponsorship === "string" ? sponsorship : undefined,
      });
    }
    return out;
  },
};
