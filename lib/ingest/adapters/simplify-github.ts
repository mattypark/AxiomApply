import type { Source } from "@/types/database";
import {
  clean,
  parseTerm,
  type RawInternship,
  type SourceAdapter,
} from "../types";

/**
 * SimplifyJobs listing repos (e.g. SimplifyJobs/Summer2026-Internships)
 * publish machine-readable listings JSON inside the repo. Path + branch live
 * in sources.config so a repo layout change is a DB edit, not a deploy.
 *
 * config: {
 *   repo: "SimplifyJobs/Summer2026-Internships",
 *   branch?: "dev",                       // falls back to dev, then main
 *   path?: ".github/scripts/listings.json",
 *   season?: "summer", year?: 2026        // fallback when a listing has no terms
 * }
 */

type SimplifyListing = {
  company_name?: string;
  title?: string;
  locations?: string[];
  url?: string;
  active?: boolean;
  is_visible?: boolean;
  sponsorship?: string;
  terms?: string[];
  category?: string;
};

export const simplifyGithubAdapter: SourceAdapter = {
  key: "simplify_github",

  async fetchListings(source: Source): Promise<RawInternship[]> {
    const cfg = source.config as {
      repo?: string;
      branch?: string;
      path?: string;
      season?: RawInternship["season"];
      year?: number;
    };
    const repo = cfg.repo ?? repoFromUrl(source.url);
    if (!repo) throw new Error("simplify_github: no repo in config or url");

    const path = cfg.path ?? ".github/scripts/listings.json";
    const branches = cfg.branch ? [cfg.branch] : ["dev", "main"];

    let listings: SimplifyListing[] | null = null;
    let lastError = "";
    for (const branch of branches) {
      const url = `https://raw.githubusercontent.com/${repo}/${branch}/${path}`;
      const res = await fetch(url, { cache: "no-store" });
      if (res.ok) {
        listings = (await res.json()) as SimplifyListing[];
        break;
      }
      lastError = `${url} → ${res.status}`;
    }
    if (!listings) throw new Error(`simplify_github: listings not found (${lastError})`);

    const out: RawInternship[] = [];
    for (const l of listings) {
      if (!l.company_name || !l.title) continue;
      if (l.is_visible === false) continue;

      const term = l.terms?.map(parseTerm).find(Boolean) ?? null;
      const season = term?.season ?? cfg.season;
      if (!season) continue;

      out.push({
        company: clean(l.company_name),
        role: clean(l.title),
        season,
        year: term?.year ?? cfg.year,
        locations: (l.locations ?? []).map(clean).filter(Boolean),
        url: l.url,
        sponsorship: l.sponsorship,
        categories: l.category ? [clean(l.category)] : [],
        // SimplifyJobs is authoritative about open/closed
        isOpen: l.active !== false,
      });
    }
    return out;
  },
};

function repoFromUrl(url: string): string | null {
  const m = url.match(/github\.com\/([^/]+\/[^/#?]+)/);
  return m ? m[1].replace(/\.git$/, "") : null;
}
