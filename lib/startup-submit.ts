import "server-only";

/**
 * The startup Sheet write.
 *
 * Deliberately NOT modelled on lib/apply-submit.ts. That one is a frozen
 * browser no-cors POST because the intern form ships base64 files and its
 * Apps Script has parsed exactly that shape since the Astro build. The startup
 * form has no uploads and already runs through a server action, so this posts
 * from the server: the response is readable, so a failure can be logged
 * instead of vanishing into an opaque promise.
 *
 * Destination is APPS_SCRIPT_STARTUPS.gs on its own spreadsheet — a different
 * script, a different deployment, and a different Sheet from the interns.
 *
 * Best effort by contract: the caller must never let a Sheet failure block the
 * Supabase insert, because Supabase is what the product reads.
 */

const WEBHOOK = process.env.STARTUP_APPS_SCRIPT_WEBHOOK ?? "";

export type SheetWriteResult =
  | { ok: true }
  | { ok: false; reason: "not-configured" | "request-failed" | "rejected" };

export async function postStartupToSheet(
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
