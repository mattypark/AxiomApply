"use client";

import { useOptimistic, useTransition } from "react";
import { toggleSave } from "@/lib/actions/internships";

export function SaveButton({
  internshipId,
  saved,
  canSave,
}: {
  internshipId: string;
  saved: boolean;
  canSave: boolean;
}) {
  const [optimistic, setOptimistic] = useOptimistic(saved);
  const [, startTransition] = useTransition();

  return (
    <button
      type="button"
      aria-label={optimistic ? "Remove from saved" : "Save internship"}
      aria-pressed={optimistic}
      title={canSave ? undefined : "Sign in to save"}
      onClick={() =>
        startTransition(async () => {
          setOptimistic(!optimistic);
          await toggleSave(internshipId);
        })
      }
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-[background-color,transform] duration-300 hover:scale-110 ${
        optimistic
          ? "bg-forest text-white shadow-[0_6px_18px_rgba(47,107,61,0.35)]"
          : "bg-white/50 text-muted shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] hover:text-ink"
      }`}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M6 2h12a1 1 0 0 1 1 1v19l-7-4.5L5 22V3a1 1 0 0 1 1-1z" />
      </svg>
    </button>
  );
}
