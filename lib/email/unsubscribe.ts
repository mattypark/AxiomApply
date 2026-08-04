import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Unsubscribe links are signed, not guessable: an address plus an HMAC over it.
 * No lookup table, no unsubscribe id to leak, and someone cannot opt a stranger
 * out by editing a query string.
 *
 * Topic-scoped on purpose (docs/email-program.md): unsubscribing from network
 * updates must never stop someone receiving news about their own application.
 */

export const MARKETING_TOPIC = "network-updates";

function secret(): string {
  return process.env.EMAIL_UNSUB_SECRET?.trim() ?? "";
}

function sign(email: string, topic: string): string {
  return createHmac("sha256", secret())
    .update(`${topic}:${email.toLowerCase()}`)
    .digest("hex");
}

export function unsubscribeUrl(email: string, topic = MARKETING_TOPIC): string | undefined {
  if (!secret()) return undefined;

  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://axiomapply.com";
  const params = new URLSearchParams({
    email,
    topic,
    token: sign(email, topic),
  });
  return `${site}/api/unsubscribe?${params.toString()}`;
}

export function isValidToken(email: string, topic: string, token: string): boolean {
  if (!secret() || !token) return false;

  const expected = Buffer.from(sign(email, topic));
  const given = Buffer.from(token);
  if (expected.length !== given.length) return false;
  return timingSafeEqual(expected, given);
}
