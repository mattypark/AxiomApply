import * as cheerio from "cheerio";
import type { Source } from "@/types/database";
import {
  clean,
  parseTerm,
  type RawInternship,
  type SourceAdapter,
} from "../types";

/**
 * Interndock tracker/guide pages (e.g. the Summer 2027 internships list).
 * HTML scraping is inherently fragile, so:
 *  1. try structured data first (__NEXT_DATA__, then JSON-LD ItemList)
 *  2. fall back to DOM selectors stored in sources.config.selectors —
 *     fixable from /admin/sources without a deploy
 *
 * config: {
 *   season: "summer", year: 2027,
 *   selectors?: {
 *     row: "table tbody tr",
 *     company: "td:nth-child(1)",
 *     role: "td:nth-child(2)",
 *     location?: "td:nth-child(3)",
 *     link?: "a"
 *   }
 * }
 */

const DEFAULT_SELECTORS = {
  row: "table tbody tr",
  company: "td:nth-child(1)",
  role: "td:nth-child(2)",
  location: "td:nth-child(3)",
  link: "a",
};

export const interndockAdapter: SourceAdapter = {
  key: "interndock_html",

  async fetchListings(source: Source): Promise<RawInternship[]> {
    const cfg = source.config as {
      season?: RawInternship["season"];
      year?: number;
      selectors?: Partial<typeof DEFAULT_SELECTORS>;
    };
    const fallback = inferTermFromUrl(source.url);
    const season = cfg.season ?? fallback?.season;
    const year = cfg.year ?? fallback?.year;
    if (!season) throw new Error("interndock_html: config.season required");

    const res = await fetch(source.url, {
      cache: "no-store",
      headers: {
        "user-agent":
          "Mozilla/5.0 (compatible; AxiomPathwaysBot/1.0; +https://www.axiompathways.org)",
      },
    });
    if (!res.ok) throw new Error(`interndock_html: ${source.url} → ${res.status}`);
    const html = await res.text();
    const $ = cheerio.load(html);

    // 1) __NEXT_DATA__ — most Next.js trackers embed everything here.
    const nextData = $("script#__NEXT_DATA__").html();
    if (nextData) {
      try {
        const fromNext = harvestObjects(JSON.parse(nextData), season, year);
        if (fromNext.length >= 5) return fromNext;
      } catch {
        /* fall through */
      }
    }

    // 2) JSON-LD ItemList / JobPosting
    const fromLd: RawInternship[] = [];
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        fromLd.push(...harvestObjects(JSON.parse($(el).html() ?? ""), season, year));
      } catch {
        /* ignore malformed blocks */
      }
    });
    if (fromLd.length >= 5) return fromLd;

    // 3) DOM selectors (config-overridable)
    const sel = { ...DEFAULT_SELECTORS, ...(cfg.selectors ?? {}) };
    const out: RawInternship[] = [];
    $(sel.row).each((_, row) => {
      const $row = $(row);
      const company = clean($row.find(sel.company).first().text());
      const role = clean($row.find(sel.role).first().text());
      if (!company || !role) return;
      const location = sel.location
        ? clean($row.find(sel.location).first().text())
        : "";
      const href = $row.find(sel.link).first().attr("href");
      out.push({
        company,
        role,
        season,
        year,
        locations: location ? [location] : [],
        url: href ? new URL(href, source.url).toString() : undefined,
      });
    });
    return out;
  },
};

/**
 * Walk arbitrary JSON and collect objects that look like internship
 * listings (company + title/role shaped fields).
 */
function harvestObjects(
  node: unknown,
  season: RawInternship["season"],
  year: number | undefined,
  depth = 0,
): RawInternship[] {
  if (depth > 8 || node == null) return [];
  if (Array.isArray(node)) {
    return node.flatMap((n) => harvestObjects(n, season, year, depth + 1));
  }
  if (typeof node !== "object") return [];

  const obj = node as Record<string, unknown>;
  const company = firstString(obj, ["company", "company_name", "companyName", "employer", "hiringOrganization.name"]);
  const role = firstString(obj, ["role", "title", "position", "job_title", "jobTitle", "name"]);

  if (company && role && looksLikeRole(role)) {
    const url = firstString(obj, ["url", "link", "apply_url", "applyUrl", "href"]);
    const location = firstString(obj, ["location", "locations", "city", "jobLocation.address.addressLocality"]);
    return [
      {
        company: clean(company),
        role: clean(role),
        season,
        year,
        url,
        locations: location ? [clean(location)] : [],
      },
    ];
  }
  return Object.values(obj).flatMap((v) => harvestObjects(v, season, year, depth + 1));
}

function firstString(obj: Record<string, unknown>, paths: string[]): string | undefined {
  for (const p of paths) {
    const v = p
      .split(".")
      .reduce<unknown>(
        (o, k) => (o && typeof o === "object" ? (o as Record<string, unknown>)[k] : undefined),
        obj,
      );
    if (typeof v === "string" && v.trim()) return v;
    if (Array.isArray(v) && typeof v[0] === "string" && v[0].trim()) return v[0];
  }
  return undefined;
}

function looksLikeRole(s: string): boolean {
  return /intern|engineer|analyst|design|market|product|research|develop|swe|data/i.test(s);
}

function inferTermFromUrl(url: string) {
  return parseTerm(url.replace(/[-_/]/g, " "));
}
