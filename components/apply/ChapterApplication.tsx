"use client";

import {
  ApplyEngine,
  type ApplyPrefill,
  type SubmitResult,
} from "@/components/apply/ApplyEngine";
import { CHAPTER_SET } from "@/lib/apply-sections";
import { submitChapterApplication } from "@/lib/actions/applications";

/**
 * The chapter application.
 *
 * Runs on the grey surface — intern white, startup night, chapter charcoal.
 * Unlike the intern side there is no frozen browser webhook here: the whole
 * submission goes through one server action, which writes Supabase first and
 * the chapter spreadsheet second.
 */
export function ChapterApplication({
  prefill,
  backHref,
}: {
  prefill?: ApplyPrefill;
  backHref?: string;
}) {
  async function handleSubmit(
    answers: Record<string, string>,
  ): Promise<SubmitResult> {
    const result = await submitChapterApplication(answers);
    return { ok: result.ok, error: result.error };
  }

  return (
    <ApplyEngine
      set={CHAPTER_SET}
      prefill={prefill}
      backHref={backHref}
      variant="grey"
      onSubmit={handleSubmit}
    />
  );
}
