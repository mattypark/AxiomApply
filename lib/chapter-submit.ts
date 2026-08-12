import "server-only";

/**
 * The chapter Sheet write.
 *
 * Same shape as lib/startup-submit.ts and for the same reason: the chapter
 * form has no uploads and already runs through a server action, so this posts
 * from the server where the response can actually be read and a failure logged
 * instead of vanishing into an opaque no-cors promise.
 *
 * Destination is APPS_SCRIPT_CHAPTERS.gs on its own spreadsheet — a different
 * script, a different deployment, and a different Sheet from both the interns
 * and the startups. Neither of those is touched by this file.
 *
 * Best effort by contract: the caller must never let a Sheet failure block the
 * Supabase insert, because Supabase is what Chapter HQ reads.
 */

const WEBHOOK = process.env.CHAPTER_APPS_SCRIPT_WEBHOOK ?? "";

export type SheetWriteResult =
  | { ok: true }
  | { ok: false; reason: "not-configured" | "request-failed" | "rejected" };

export async function postChapterToSheet(
  answers: Record<string, string>,
): Promise<SheetWriteResult> {
  if (!WEBHOOK) return { ok: false, reason: "not-configured" };

  const payload = new URLSearchParams();
  for (const [key, value] of Object.entries(answers)) {
    const trimmed = value?.trim();
    if (trimmed) payload.set(key, trimmed);
  }

  try {
    // Apps Script /exec answers with a 302 to script.googleusercontent.com;
    // fetch follows it, so the JSON body below is the script's real reply.
    const response = await fetch(WEBHOOK, {
      method: "POST",
      body: payload,
      // A hung Google request must not hold the applicant's submit open.
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) return { ok: false, reason: "request-failed" };

    const body = (await response.json()) as { ok?: boolean };
    return body.ok ? { ok: true } : { ok: false, reason: "rejected" };
  } catch {
    return { ok: false, reason: "request-failed" };
  }
}
