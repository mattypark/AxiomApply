import "server-only";

/**
 * The careers Sheet write.
 *
 * Same shape as lib/chapter-submit.ts and lib/startup-submit.ts, and for the
 * same reason: no uploads, already inside a server action, so the response can
 * be read and a failure logged instead of vanishing into a no-cors promise.
 *
 * Destination is APPS_SCRIPT_CAREERS.gs on its own spreadsheet — a different
 * script, a different deployment, and a different Sheet from the interns, the
 * startups, and the chapters. None of those are touched by this file.
 *
 * Best effort by contract: the caller must never let a Sheet failure block the
 * Supabase insert, because Supabase is the record of what was submitted.
 */

const WEBHOOK = process.env.CAREERS_APPS_SCRIPT_WEBHOOK ?? "";

export type SheetWriteResult =
  | { ok: true }
  | { ok: false; reason: "not-configured" | "request-failed" | "rejected" };

export async function postCareerToSheet(
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
