import "server-only";

/**
 * Resend transport.
 *
 * Spoken to over its REST API with plain `fetch` — no SDK, no new dependency.
 * Two senders, two reputations, per docs/email-program.md: a rejection email
 * must never land in spam because a Learn-module blast tanked shared
 * reputation.
 *
 *   tx.axiomapply.com    transactional — welcome, received, decisions
 *   news.axiomapply.com  marketing — cohort news, nudges, reactivation
 *
 * Marketing mail carries List-Unsubscribe headers (Resend adds these for
 * Broadcasts but not for API sends) and always includes the postal address.
 */

const ENDPOINT = "https://api.resend.com/emails";

export type MailClass = "transactional" | "marketing";

export type SendInput = {
  to: string;
  subject: string;
  /** Plain text only. Left-aligned, one column, system font — by design. */
  text: string;
  mailClass: MailClass;
  /** Absolute URL. Required for marketing, ignored for transactional. */
  unsubscribeUrl?: string;
  headers?: Record<string, string>;
};

export type SendResult = { ok: boolean; id?: string; error?: string };

function env(name: string): string {
  return process.env[name]?.trim() ?? "";
}

function sender(mailClass: MailClass): string {
  const configured =
    mailClass === "marketing"
      ? env("RESEND_FROM_NEWS")
      : env("RESEND_FROM_TX");
  // Older single-sender setups fall back to RESEND_FROM so nothing breaks
  // before the second subdomain is verified.
  return configured || env("RESEND_FROM");
}

/** True when email is configured enough to actually send. */
export function isEmailConfigured(): boolean {
  return env("RESEND_API_KEY").length > 0 && sender("transactional").length > 0;
}

export async function sendEmail(input: SendInput): Promise<SendResult> {
  const apiKey = env("RESEND_API_KEY");
  const from = sender(input.mailClass);

  if (!apiKey || !from) {
    // Not wired yet. Say so rather than pretending mail went out.
    return { ok: false, error: "email-not-configured" };
  }

  const headers: Record<string, string> = { ...input.headers };
  if (input.mailClass === "marketing" && input.unsubscribeUrl) {
    headers["List-Unsubscribe"] = `<${input.unsubscribeUrl}>, <mailto:${
      env("EMAIL_UNSUB_MAILBOX") || "unsub@axiompathways.org"
    }>`;
    headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click";
  }

  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [input.to],
        reply_to: env("RESEND_REPLY_TO") || undefined,
        subject: input.subject,
        text: input.text,
        headers: Object.keys(headers).length > 0 ? headers : undefined,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      return { ok: false, error: `resend-${response.status}: ${body.slice(0, 200)}` };
    }

    const data = (await response.json()) as { id?: string };
    return { ok: true, id: data.id };
  } catch (error: unknown) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "send-failed",
    };
  }
}
