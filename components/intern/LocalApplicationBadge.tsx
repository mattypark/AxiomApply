"use client";

import { useEffect, useState } from "react";
import { submittedKey } from "@/components/apply/ApplyEngine";

/**
 * Fallback confirmation for an application the server cannot vouch for yet.
 *
 * The Supabase row is the truth, but it is not always there: the applicant may
 * have submitted signed-out, or the mirror write may have failed while the
 * Google Sheet — the authoritative destination — took the submission fine.
 * Telling someone "no application yet" minutes after they submitted is the
 * worst possible answer, so this reads the local marker the apply engine
 * leaves behind and says so plainly.
 *
 * Renders nothing when the server already knows: `serverKnows` short-circuits
 * it so the real status always wins.
 */
export function LocalApplicationBadge({
  serverKnows,
}: {
  serverKnows: boolean;
}) {
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);

  useEffect(() => {
    if (serverKnows) return;
    try {
      const raw = localStorage.getItem(submittedKey("intern"));
      if (!raw) return;
      const parsed = JSON.parse(raw) as { at?: string };
      if (parsed.at) setSubmittedAt(parsed.at);
    } catch {
      // Malformed or unavailable storage — just show nothing.
    }
  }, [serverKnows]);

  if (serverKnows || !submittedAt) return null;

  const when = new Date(submittedAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });

  return (
    <span className="chip chip-forest">Application sent · {when}</span>
  );
}
