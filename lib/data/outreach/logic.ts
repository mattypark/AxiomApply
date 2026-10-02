import { OUTREACH_STATUSES, type OutreachPatch, type OutreachRow, type OutreachStatus } from "./types.ts";

/**
 * The outreach desk's pure parts: filtering, sorting, counting, CSV, and the
 * one validator every write goes through. No I/O, so tests cover all of it.
 */

export const YC_DEAL_USD = 500_000;

export type OutreachSort = "contact" | "raised" | "name" | "batch" | "updated";
export type EmailFilter = "" | "found" | "inbox" | "guess" | "none";

export interface OutreachFilters {
  query: string;
  batch: string;
  status: OutreachStatus | "";
  email: EmailFilter;
  raised: boolean;
  hiring: boolean;
  aboutYou: boolean;
  sort: OutreachSort;
}

export const EMPTY_OUTREACH_FILTERS: OutreachFilters = {
  query: "",
  batch: "",
  status: "",
  email: "",
  raised: false,
  hiring: false,
  aboutYou: false,
  sort: "contact",
};

export const BATCH_ORDER = ["W26", "X26", "S26", "F26"] as const;
export const BATCH_NAME: Record<string, string> = { W26: "Winter", X26: "Spring", S26: "Summer", F26: "Fall" };

/** The address an email goes to: a hand-set one first, else the best one found. */
export function contactFor(row: OutreachRow) {
  if (row.contact) return { name: row.company.best?.name ?? null, email: row.contact, source: "manual" as const, offDomain: false };
  return row.company.best;
}

/** An announced round beyond YC's standard deal, or null. */
export function raiseOf(row: OutreachRow) {
  return row.funding?.status === "announced" && typeof row.funding.amountUsd === "number" ? row.funding : null;
}

/** "was into this too" openers say something first-person about Matthew, which only he can confirm. */
export function claimsAboutMatthew(row: OutreachRow): boolean {
  return /into this|was into/i.test(row.draft?.style ?? "");
}

const SOURCE_ORDER: Record<string, number> = { manual: -1, found: 0, inbox: 1, guess: 2 };

function searchText(row: OutreachRow): string {
  const { company } = row;
  return [
    company.name,
    company.oneLiner,
    company.industry,
    company.locations,
    company.domain,
    ...company.founders.map((founder) => `${founder.name} ${founder.email ?? ""}`),
    row.draft?.subject,
    row.draft?.hook,
    row.contact,
    row.note,
  ]
    .join(" ")
    .toLowerCase();
}

export function filterRows(rows: readonly OutreachRow[], filters: OutreachFilters): OutreachRow[] {
  const terms = filters.query.toLowerCase().split(/\s+/).filter(Boolean);
  const out = rows.filter((row) => {
    if (filters.batch && row.company.batchShort !== filters.batch) return false;
    if (filters.status && row.status !== filters.status) return false;
    if (filters.raised && !raiseOf(row)) return false;
    if (filters.hiring && row.company.jobCount === 0) return false;
    if (filters.aboutYou && !claimsAboutMatthew(row)) return false;
    if (filters.email) {
      const contact = contactFor(row);
      if (filters.email === "none" ? contact : contact?.source !== filters.email) return false;
    }
    if (terms.length) {
      const text = searchText(row);
      if (!terms.every((term) => text.includes(term))) return false;
    }
    return true;
  });
  return sortRows(out, filters.sort);
}

export function sortRows(rows: OutreachRow[], sort: OutreachSort): OutreachRow[] {
  const byName = (a: OutreachRow, b: OutreachRow) => a.company.name.localeCompare(b.company.name);
  const raised = (row: OutreachRow) => raiseOf(row)?.amountUsd ?? 0;
  const compare: Record<OutreachSort, (a: OutreachRow, b: OutreachRow) => number> = {
    contact: (a, b) =>
      (SOURCE_ORDER[contactFor(a)?.source ?? ""] ?? 9) - (SOURCE_ORDER[contactFor(b)?.source ?? ""] ?? 9) ||
      b.company.internJobs - a.company.internJobs ||
      b.company.jobCount - a.company.jobCount ||
      byName(a, b),
    raised: (a, b) => raised(b) - raised(a) || byName(a, b),
    name: byName,
    batch: (a, b) => BATCH_ORDER.indexOf(b.company.batchShort as never) - BATCH_ORDER.indexOf(a.company.batchShort as never) || byName(a, b),
    updated: (a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? "") || byName(a, b),
  };
  return [...rows].sort(compare[sort]);
}

export function outreachCounts(rows: readonly OutreachRow[]) {
  const statuses = Object.fromEntries(OUTREACH_STATUSES.map((status) => [status, 0])) as Record<OutreachStatus, number>;
  for (const row of rows) statuses[row.status]++;
  return {
    companies: rows.length,
    founders: rows.reduce((sum, row) => sum + row.company.founders.length, 0),
    drafts: rows.filter((row) => row.draft).length,
    found: rows.filter((row) => contactFor(row)?.source === "found").length,
    guess: rows.filter((row) => contactFor(row)?.source === "guess").length,
    raised: rows.filter((row) => raiseOf(row)).length,
    aboutYou: rows.filter(claimsAboutMatthew).length,
    statuses,
  };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NOTE_MAX = 4000;
const SLUG_RE = /^[a-z0-9-]{1,120}$/;
export const MAX_SLUGS_PER_UPDATE = 1000;

/** Parse an update request. Only these fields, only these shapes, ever reach the database. */
export function parseUpdate(input: unknown): { ok: true; slugs: string[]; patch: OutreachPatch } | { ok: false; error: string } {
  if (!input || typeof input !== "object") return { ok: false, error: "Bad request" };
  const { slugs, patch } = input as { slugs?: unknown; patch?: unknown };
  if (!Array.isArray(slugs) || slugs.length === 0 || slugs.length > MAX_SLUGS_PER_UPDATE) return { ok: false, error: "Pick at least one company" };
  if (!slugs.every((slug) => typeof slug === "string" && SLUG_RE.test(slug))) return { ok: false, error: "Bad company id" };
  if (!patch || typeof patch !== "object") return { ok: false, error: "Nothing to change" };

  const raw = patch as Record<string, unknown>;
  const clean: OutreachPatch = {};
  if ("status" in raw) {
    if (!OUTREACH_STATUSES.includes(raw.status as OutreachStatus)) return { ok: false, error: "Unknown status" };
    clean.status = raw.status as OutreachStatus;
  }
  if ("note" in raw) {
    if (typeof raw.note !== "string") return { ok: false, error: "Bad note" };
    clean.note = raw.note.slice(0, NOTE_MAX);
  }
  if ("contact" in raw) {
    const contact = raw.contact;
    if (contact !== null && (typeof contact !== "string" || !EMAIL_RE.test(contact.trim()))) return { ok: false, error: "That isn't an email address" };
    clean.contact = typeof contact === "string" ? contact.trim().toLowerCase() : null;
  }
  if (Object.keys(clean).length === 0) return { ok: false, error: "Nothing to change" };
  return { ok: true, slugs: [...new Set(slugs as string[])], patch: clean };
}

/** Columns the Google Sheet mailer reads by header name (axiom-yc-outreach/mailer). */
export const CSV_COLUMNS = [
  "slug", "company", "batch", "website", "to_name", "to_email", "email_source", "subject", "body",
  "status", "approved", "sent_at", "thread_id", "followup_sent_at", "replied", "notes",
  "raised_usd", "raised_round", "founder_linkedins", "yc_url",
] as const;

export function csvCell(value: unknown): string {
  const text = String(value ?? "");
  // A leading = + - @ would run as a formula when the CSV opens in Sheets.
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

export function toOutreachCsv(rows: readonly OutreachRow[]): string {
  const lines = [CSV_COLUMNS.join(",")];
  for (const row of rows) {
    const contact = contactFor(row);
    const round = raiseOf(row);
    const values: Record<(typeof CSV_COLUMNS)[number], unknown> = {
      slug: row.slug,
      company: row.company.name,
      batch: row.company.batchShort,
      website: row.company.website,
      to_name: contact?.name ?? "",
      to_email: contact?.email ?? "",
      email_source: contact?.source ?? "",
      subject: row.draft?.subject ?? "",
      body: row.draft?.body ?? "",
      status: row.status,
      approved: "FALSE",
      sent_at: "",
      thread_id: "",
      followup_sent_at: "",
      replied: "",
      notes: row.note,
      raised_usd: round?.amountUsd ?? "",
      raised_round: round?.round ?? "",
      founder_linkedins: row.company.founders.map((founder) => founder.linkedin).filter(Boolean).join(" "),
      yc_url: row.company.ycUrl,
    };
    lines.push(CSV_COLUMNS.map((column) => csvCell(values[column])).join(","));
  }
  return `${lines.join("\n")}\n`;
}

/** Only http(s) links ever reach an href: everything here was scraped. */
export function safeUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.toString() : null;
  } catch {
    return null;
  }
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function shortTitle(title: string | null): string {
  const match = title?.match(/\b(CEO|CTO|COO|CPO|CFO)\b/i);
  return match ? match[1].toUpperCase() : "";
}

export function metaLine(row: OutreachRow): string {
  const { teamSize, locations, industry } = row.company;
  return [teamSize ? `${teamSize} ${teamSize === 1 ? "person" : "people"}` : null, locations, industry].filter(Boolean).join(" · ");
}
