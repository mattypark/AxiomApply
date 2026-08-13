import "server-only";

import type { ApplicationStatus } from "@/lib/applications";

/**
 * Reading review decisions back out of the Google Sheet.
 *
 * The Sheet stays the working surface — Matthew marks people in column Y and
 * presses a menu item (APPS_SCRIPT_DECISIONS.gs), which POSTs every row here.
 * This module is the parsing half: it turns display strings typed by a human
 * into the CHECK-constrained vocabulary in 0013_applications.sql, and refuses
 * to guess when it can't.
 *
 * The refusing part matters more than the parsing part. Column Y currently
 * holds two POOL rows and a stray timestamp; a mapping that treated anything
 * unrecognised as "no decision" would have mailed those people a waitlist
 * notice on Matthew's behalf. Unknown values skip the person entirely and come
 * back in the response so the Sheet can be fixed and the push re-run.
 */

export type SheetRow = {
  row: number;
  timestamp?: string;
  name?: string;
  email?: string;
  reviewer?: string;
  decision?: string;
  category?: string;
};

/** What column Y is allowed to say. Compared case-insensitively, trimmed. */
const DECISION_WORDS: Record<string, ApplicationStatus> = {
  accepted: "accepted",
  rejected: "rejected",
  waitlist: "waitlist",
  waitlisted: "waitlist",
  withdrawn: "withdrawn",
};

export type ParsedRow = {
  row: number;
  email: string;
  name: string | null;
  reviewer: string | null;
  category: string | null;
  status: ApplicationStatus;
  /** True when the cell was empty — an applicant nobody has looked at yet. */
  undecided: boolean;
  submittedAt: string | null;
};

export type SkippedRow = { row: number; value: string; why: string };

export type ParseResult = {
  received: number;
  people: ParsedRow[];
  skipped: SkippedRow[];
  duplicatesCollapsed: number;
};

/**
 * Sheet timestamps arrive as display strings ("6/6/2026 23:35:51"). An
 * unparseable one is not worth failing a push over — it only affects ordering
 * and the submitted_at we record for rows the site has never seen.
 */
function parseSheetDate(raw?: string): string | null {
  if (!raw) return null;
  const ms = Date.parse(raw);
  return Number.isNaN(ms) ? null : new Date(ms).toISOString();
}

function parseDecision(
  raw: string | undefined,
): { ok: true; status: ApplicationStatus; undecided: boolean } | { ok: false } {
  const value = (raw ?? "").trim();
  if (!value) return { ok: true, status: "applied", undecided: true };

  const mapped = DECISION_WORDS[value.toLowerCase()];
  if (!mapped) return { ok: false };
  return { ok: true, status: mapped, undecided: false };
}

/**
 * One person, one outcome — even though 732 sheet rows carry only 666 distinct
 * addresses. People reapply, and a few submitted the same form twice in a
 * minute; either way they must not receive the same decision email twice.
 *
 * Collapse rules, in order:
 *   1. Any unreadable decision anywhere in a person's rows disqualifies the
 *      whole person. Half their rows saying "Rejected" and half saying "POOL"
 *      is exactly the ambiguity a human should resolve, not this function.
 *   2. A real decision beats a blank, however old it is.
 *   3. Between two real decisions, the later timestamp wins.
 */
export function parseSheetRows(rows: SheetRow[]): ParseResult {
  const skipped: SkippedRow[] = [];
  const byEmail = new Map<string, ParsedRow>();
  const poisoned = new Set<string>();
  let received = 0;

  for (const raw of rows) {
    const email = (raw.email ?? "").trim().toLowerCase();
    if (!email.includes("@")) {
      skipped.push({ row: raw.row, value: raw.email ?? "", why: "not an email address" });
      continue;
    }
    received += 1;

    const decision = parseDecision(raw.decision);
    if (!decision.ok) {
      skipped.push({
        row: raw.row,
        value: (raw.decision ?? "").trim(),
        why: "unrecognised decision",
      });
      poisoned.add(email);
      byEmail.delete(email);
      continue;
    }
    if (poisoned.has(email)) continue;

    const candidate: ParsedRow = {
      row: raw.row,
      email,
      name: raw.name?.trim() || null,
      reviewer: raw.reviewer?.trim() || null,
      category: raw.category?.trim() || null,
      status: decision.status,
      undecided: decision.undecided,
      submittedAt: parseSheetDate(raw.timestamp),
    };

    const existing = byEmail.get(email);
    if (!existing) {
      byEmail.set(email, candidate);
      continue;
    }

    if (existing.undecided && !candidate.undecided) {
      byEmail.set(email, candidate);
      continue;
    }
    if (!existing.undecided && candidate.undecided) continue;

    // Same kind of row on both sides — newest wins.
    const a = existing.submittedAt ?? "";
    const b = candidate.submittedAt ?? "";
    if (b >= a) byEmail.set(email, candidate);
  }

  return {
    received,
    people: [...byEmail.values()],
    skipped,
    duplicatesCollapsed: received - byEmail.size - poisoned.size,
  };
}
