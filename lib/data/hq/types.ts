import type { Side } from "../../apply-sides";

/**
 * HQ's data seam: every shape the dashboard sends or receives.
 *
 * Client-safe on purpose (types only, no database client), so the UI can
 * import it. The server implements `HqSource` over Supabase today and over D1
 * after the Cloudflare move, behind the same signatures; the browser talks to
 * it through `HqClient`, which is the same set of calls minus the actor, who
 * comes from the session on the server rather than from the page.
 *
 * Spec: docs/DESIGN-AFTER-SUBMIT.md, "Data seam".
 */

export type { Side };

/** One status word for all three sides. "accepted" reads "Approved" for startups and chapters. */
export type HqStatus = "new" | "read" | "accepted" | "waitlist" | "rejected" | "withdrawn";

/** What a person can decide in HQ. "withdrawn" is the applicant's move, not ours. */
export type HqDecision = "accepted" | "waitlist" | "rejected";

export type Range = "7" | "30" | "60" | "all";

/** The breakdowns that cross-filter. Each chart ignores its own. */
export type Dimension = "chapter" | "org" | "grade" | "interest";

export type HqFilters = {
  range: Range;
  side: Side | "all";
  status: HqStatus | "all";
  query: string;
  chapter: string | null;
  /** School for interns and chapters, company for startups. */
  org: string | null;
  grade: string | null;
  interest: string | null;
};

export const EMPTY_FILTERS: HqFilters = {
  range: "30",
  side: "all",
  status: "all",
  query: "",
  chapter: null,
  org: null,
  grade: null,
  interest: null,
};

/** One application, any side, as the list shows it. No phone number, ever. */
export type HqRow = {
  /** `<side>:<uuid>`: the three tables share no id space. */
  id: string;
  side: Side;
  name: string;
  email: string;
  org: string | null;
  chapter: string | null;
  grade: string | null;
  interest: string | null;
  headline: string;
  status: HqStatus;
  /** ISO timestamps. */
  submittedAt: string;
  readAt: string | null;
  /** Who read it: the Sheet's column X, or whoever pressed Mark read. */
  reviewer: string | null;
  decidedAt: string | null;
  decidedVia: "sheet" | "hq" | null;
  sheetRow: number | null;
};

export type Bar = { label: string; value: number };
export type Day = { date: string } & Record<Side, number>;
export type FunnelStep = { key: "received" | "read" | "decided" | "accepted"; label: string; value: number };

export type Kpis = {
  total: number;
  thisWeek: number;
  lastWeek: number;
  unread: number;
  oldestUnreadDays: number;
  medianDaysToRead: number | null;
};

export type HqStats = {
  kpis: Kpis;
  daily: Day[];
  funnel: FunnelStep[];
  by: Record<"side" | Dimension, Bar[]>;
  /** Every application ever, before any filter: tells "nobody yet" from "nobody matches". */
  everything: number;
  /** Sides whose table could not be read. The rest still render. */
  missing: Side[];
  /** True when the database predates 0020_hq.sql: read and decide can't be saved yet. */
  needsMigration: boolean;
};

export type HqSort = "newest" | "oldest-unread";
export type HqPage = { offset: number; size: number; sort: HqSort };
export type HqList = { rows: HqRow[]; total: number };

export type HqAnswer = { label: string; value: string };

export type HqDetail = HqRow & {
  answers: HqAnswer[];
  /** What column Y said on the last Sheet push, when that differs from HQ's decision. */
  sheetDecision: string | null;
  decidedBy: string | null;
};

export type HqContact = { email: string; phone: string | null };

export type Ok = { ok: boolean; error?: string };

export interface HqSource {
  stats(filters: HqFilters): Promise<HqStats>;
  list(filters: HqFilters, page: HqPage): Promise<HqList>;
  get(id: string): Promise<HqDetail | null>;
  /** Logged: a minor's phone number is the thing worth a record. */
  contact(id: string, by: string): Promise<HqContact | null>;
  /** Never mails anyone. Decision mail still goes out from /admin/applications. */
  decide(id: string, status: HqDecision, by: string): Promise<Ok>;
  markRead(id: string, by: string): Promise<Ok>;
  /** The current slice as CSV, phone numbers included (Matthew, 2026-09-28). Logged. */
  exportCsv(filters: HqFilters, by: string): Promise<string>;
}

/** What the page calls. The server fills in the actor from the session. */
export interface HqClient {
  stats(filters: HqFilters): Promise<HqStats>;
  list(filters: HqFilters, page: HqPage): Promise<HqList>;
  get(id: string): Promise<HqDetail | null>;
  contact(id: string): Promise<HqContact | null>;
  decide(id: string, status: HqDecision): Promise<Ok>;
  markRead(id: string): Promise<Ok>;
  exportCsv(filters: HqFilters): Promise<string>;
}
