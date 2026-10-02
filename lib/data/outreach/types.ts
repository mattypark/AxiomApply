/**
 * HQ's YC outreach desk: every company in YC's 2026 batches, its founders,
 * the email drafted for it, its funding, and where it stands.
 *
 * Built and drafted by the separate axiom-yc-outreach tool, imported into
 * the `yc_outreach` table (scripts/import-outreach.ts), and read here behind
 * HQ's two locks. This repo is public: none of that data is ever committed.
 */

export const OUTREACH_STATUSES = ["new", "shortlist", "drafted", "approved", "sent", "replied", "call", "pass"] as const;
export type OutreachStatus = (typeof OUTREACH_STATUSES)[number];

export const STATUS_LABEL: Record<OutreachStatus, string> = {
  new: "New",
  shortlist: "Shortlist",
  drafted: "Drafted",
  approved: "Approved",
  sent: "Sent",
  replied: "Replied",
  call: "Call booked",
  pass: "Pass",
};

/** Where an address came from, best first. `guess` is a first@domain pattern nobody has confirmed. */
export type EmailSource = "found" | "inbox" | "guess" | "manual";

export interface OutreachFounder {
  name: string;
  title: string | null;
  linkedin: string | null;
  x: string | null;
  email: string | null;
  emailSource: EmailSource | null;
  /** Detail only. */
  bio?: string | null;
  /** Detail only: the other address patterns to try if a guess bounces. */
  guesses?: string[];
}

export interface OutreachLinks {
  linkedin: string | null;
  x: string | null;
  github: string | null;
  youtube: string | null;
  instagram: string | null;
  tiktok: string | null;
  discord: string | null;
  crunchbase: string | null;
  careers: string | null;
  calendar: string | null;
}

export interface OutreachCompany {
  name: string;
  batch: string;
  batchShort: string;
  website: string | null;
  domain: string | null;
  oneLiner: string;
  industry: string | null;
  locations: string;
  teamSize: number | null;
  ycUrl: string;
  logoUrl: string | null;
  links: OutreachLinks;
  founders: OutreachFounder[];
  best: { name: string | null; email: string; source: EmailSource; offDomain?: boolean } | null;
  internJobs: number;
  jobCount: number;
  /** Detail only. */
  description?: string;
  tags?: string[];
  inboxes?: { email: string; via: string }[];
  jobs?: { title: string; type: string | null; role: string | null; url: string | null }[];
  launches?: string[];
  fitRoles?: string[];
  mailProvider?: string | null;
}

export interface OutreachDraft {
  to: { name: string | null; email: string; source: string };
  subject: string;
  body: string;
  hook: string;
  style: string | null;
  closer: string | null;
  /** Detail only. */
  factsUsed?: string[];
  confidence?: string | null;
  generatedAt?: string | null;
}

export interface OutreachFunding {
  status: "announced" | "none_found" | "unchecked";
  amountUsd?: number;
  amountLabel?: string;
  round?: string | null;
  date?: string | null;
  investors?: string[];
  sourceUrl?: string;
  sourceTitle?: string | null;
  evidence?: string;
  confidence?: string;
}

export interface OutreachRow {
  slug: string;
  company: OutreachCompany;
  draft: OutreachDraft | null;
  funding: OutreachFunding | null;
  status: OutreachStatus;
  note: string;
  /** A hand-set send-to address that overrides `company.best`. */
  contact: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
}

export interface OutreachPatch {
  status?: OutreachStatus;
  note?: string;
  contact?: string | null;
}

export type OutreachList =
  | { ok: true; rows: OutreachRow[]; importedAt: string | null }
  | { ok: false; reason: "not-configured" | "not-imported" };

export type OutreachSaved = { ok: true; rows: Pick<OutreachRow, "slug" | "status" | "note" | "contact" | "updatedAt" | "updatedBy">[] } | { ok: false; error: string };

/** What the dashboard calls: over fetch in HQ, in memory in the preview. */
export interface OutreachClient {
  list(): Promise<OutreachList>;
  get(slug: string): Promise<OutreachRow | null>;
  update(slugs: string[], patch: OutreachPatch): Promise<OutreachSaved>;
}
