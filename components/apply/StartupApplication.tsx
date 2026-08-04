"use client";

import {
  ApplyEngine,
  type ApplyPrefill,
  type SubmitResult,
} from "@/components/apply/ApplyEngine";
import { STARTUP_SET } from "@/lib/apply-sections";
import { submitStartupApplication } from "@/lib/actions/applications";

/**
 * The startup application. No frozen webhook on this side — it lands in
 * Supabase only, and the account stays locked until Matthew approves it by
 * hand. Errors here DO surface, because unlike the intern side there is no
 * second destination that already has the answers.
 */
export function StartupApplication({
  prefill,
  backHref,
}: {
  prefill?: ApplyPrefill;
  backHref?: string;
}) {
  async function handleSubmit(
    answers: Record<string, string>,
  ): Promise<SubmitResult> {
    const result = await submitStartupApplication(answers);
    return { ok: result.ok, error: result.error };
  }

  return (
    <ApplyEngine
      set={STARTUP_SET}
      prefill={prefill}
      backHref={backHref}
      variant="dark"
      onSubmit={handleSubmit}
    />
  );
}
