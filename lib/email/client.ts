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
  const raw = process.env[name]?.trim() ?? "";
  // Strip one layer of wrapping quotes.
  //
  // .env.example writes the senders quoted, because dotenv strips quotes when
  // it reads a file. A dashboard does not — it stores the box verbatim — so
  // copying the line across lands `"Matthew Park <matthew@axiomapply.com>"`,
  // which is a quoted display name with no address after it. Resend answers
  // 422 and every send fails for a reason that looks nothing like its cause.
  return raw.replace(/^(['"])([\s\S]*)\1$/, "$2").trim();
}

/**
 * Reply-To, as a list.
 *
 * More than one person reads the replies to this mail, so the env holds
 * several addresses separated by commas. Resend's `reply_to` takes a string
 * or an array — a single comma-joined string is neither, and it either
 * bounces the request or produces a header no client can act on. Split it.
 */
function replyTo(): string[] | undefined {
  const addresses = env("RESEND_REPLY_TO")
    .split(",")
    .map((address) => address.trim())
    .filter((address) => address.includes("@"));
  return addresses.length > 0 ? addresses : undefined;
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

/**
 * What this deployment will actually put on an outgoing email.
 *
 * For the admin page, so "did that env var take?" is answered by looking
 * rather than by sending 660 people a test. Every value here already appears
 * in the header or footer of each message — the API key is deliberately
 * reduced to a boolean and never returned.
 *
 * `fromDomain` is the one that quietly breaks: Resend rejects any sender whose
 * domain is not verified *exactly*, so `tx.axiomapply.com` fails while
 * `axiomapply.com` is verified, and the only symptom is a 403 per send.
 */
export function emailConfigSummary(): {
  apiKeySet: boolean;
  from: string;
  fromDomain: string;
  replyTo: string;
} {
  const from = sender("transactional");
  const match = from.match(/@([^\s>]+)/);
  return {
    apiKeySet: env("RESEND_API_KEY").length > 0,
    from,
    fromDomain: match ? match[1] : "",
    replyTo: env("RESEND_REPLY_TO"),
  };
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
        reply_to: replyTo(),
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
