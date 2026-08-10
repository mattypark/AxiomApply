"use client";

import {
  ApplyEngine,
  type ApplyPrefill,
  type SubmitResult,
} from "@/components/apply/ApplyEngine";
import { INTERN_SET } from "@/lib/apply-sections";
import { postToWebhook } from "@/lib/apply-submit";
import { recordApplication, syncInternProfile } from "@/lib/actions/applications";

/**
 * The intern application. Dual write:
 *
 *   1. the Apps Script webhook — the frozen contract, fired from the browser
 *   2. Supabase `applications` — the queryable mirror, plus profile sync
 *
 * The webhook goes first and its result is never awaited for correctness: the
 * Sheet is authoritative, so a Supabase hiccup must not tell an applicant their
 * application failed when it did not.
 */
export function InternApplication({
  prefill,
  backHref,
  chrome,
}: {
  prefill?: ApplyPrefill;
  backHref?: string;
  /** "embedded" when rendered inside the workspace shell. */
  chrome?: "full" | "embedded";
}) {
  async function handleSubmit(
    answers: Record<string, string>,
    files: Record<string, File>,
  ): Promise<SubmitResult> {
    // Fold the "Other" free-text answer into startup_picks and drop the
    // helper key. The contract has one field for this, and the Sheet has one
    // column — adding a second would be silently dropped on arrival.
    const { startup_picks_other: other, ...rest } = answers;
    const outgoing = other?.trim()
      ? {
          ...rest,
          startup_picks: [rest.startup_picks, `Other: ${other.trim()}`]
            .filter(Boolean)
            .join(", "),
        }
      : rest;

    await postToWebhook(outgoing, files);

    // Best-effort mirror. Failures are invisible to the applicant by design.
    void recordApplication(outgoing).catch(() => {});
    void syncInternProfile(outgoing).catch(() => {});

    return { ok: true };
  }

  return (
    <ApplyEngine
      set={INTERN_SET}
      prefill={prefill}
      backHref={backHref}
      chrome={chrome}
      onSubmit={handleSubmit}
    />
  );
}
