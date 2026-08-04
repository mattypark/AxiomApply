import type { Source } from "@/types/database";

export type Season = "summer" | "fall" | "winter" | "spring";

export type RawInternship = {
  company: string;
  role: string;
  season: Season;
  year?: number;
  locations?: string[];
  url?: string;
  sponsorship?: string;
  categories?: string[];
  isOpen?: boolean;
};

export interface SourceAdapter {
  /** must match sources.adapter in the DB */
  key: string;
  fetchListings(source: Source): Promise<RawInternship[]>;
}

export type SourceRunResult = {
  sourceId: string;
  name: string;
  status: "ok" | "partial" | "error";
  count: number;
  error?: string;
};

const SEASON_WORDS: Record<string, Season> = {
  summer: "summer",
  fall: "fall",
  autumn: "fall",
  winter: "winter",
  spring: "spring",
};

/** Parse "Summer 2026" / "Fall 2025" style terms into season + year. */
export function parseTerm(term: string): { season: Season; year?: number } | null {
  const m = term.toLowerCase().match(/(summer|fall|autumn|winter|spring)\s*'?(\d{2,4})?/);
  if (!m) return null;
  const season = SEASON_WORDS[m[1]];
  let year: number | undefined;
  if (m[2]) {
    const n = parseInt(m[2], 10);
    year = n < 100 ? 2000 + n : n;
  }
  return { season, year };
}

/** Trim, collapse whitespace. */
export function clean(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}
