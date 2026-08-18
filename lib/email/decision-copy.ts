import "server-only";

import * as templates from "@/lib/email/templates";

/**
 * Shared bits between the decision actions and the review page.
 *
 * Separate from lib/actions/decisions.ts because that file is "use server" —
 * every export there has to be an async server action, so a constant and a
 * pure render helper cannot live in it.
 */

export type QueueTemplate = "notSelected" | "waitlisted";

/**
 * Recipients per click.
 *
 * ~550 waitlist emails in one burst, from a domain with no sending history, is
 * the fastest way to get axiomapply.com filtered — including for the auth mail
 * the site depends on. Spreading the send across days costs nothing.
 *
 * 90 also sits under Resend's free-plan ceiling of 100 a day, leaving room for
 * the site's own transactional mail on the same key. Going over does not send
 * faster: the remainder comes back 429 and waits for the next run.
 */
export const BATCH_SIZE = 90;

/**
 * Numbers and dates that appear verbatim in the copy. Typed once per cycle by
 * the person sending, never inferred: "we had 666 applications and 20 seats"
 * is a claim applicants compare with each other.
 */
export type CycleFacts = {
  applicantCount: string;
  matchCount: string;
  season: string;
  nextCycleDate: string;
};

export function firstNameOf(name: string | null | undefined): string | undefined {
  return name?.trim().split(/\s+/)[0] || undefined;
}

export function renderDecisionCopy(
  template: QueueTemplate,
  facts: CycleFacts,
  firstName?: string,
): { subject: string; text: string } {
  return template === "notSelected"
    ? templates.notSelected({ firstName, ...facts })
    : templates.waitlisted({ firstName, applicantCount: facts.applicantCount });
}
