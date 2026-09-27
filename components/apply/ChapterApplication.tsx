"use client";

import { QuestionFlow } from "@/components/onboarding/flow/QuestionFlow";
import type { ApplyPrefill, SubmitResult } from "@/components/onboarding/flow/useApplication";
import { CHAPTER_SET } from "@/lib/apply-sections";
import { submitChapterApplication } from "@/lib/actions/applications";

/**
 * The chapter application.
 *
 * Unlike the intern side there is no frozen browser webhook here: the whole
 * submission goes through one server action, which writes Supabase first and
 * the chapter spreadsheet second.
 */
export function ChapterApplication({
  prefill,
  backHref,
  chrome,
}: {
  prefill?: ApplyPrefill;
  backHref?: string;
  chrome?: "full" | "embedded";
}) {
  async function handleSubmit(
    answers: Record<string, string>,
  ): Promise<SubmitResult> {
    const result = await submitChapterApplication(answers);
    return { ok: result.ok, error: result.error };
  }

  return (
    <QuestionFlow
      set={CHAPTER_SET}
      prefill={prefill}
      backHref={backHref}
      chrome={chrome}
      returnTo="/onboarding?side=chapter"
      onSubmit={handleSubmit}
    />
  );
}
