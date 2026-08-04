"use server";

import { sendAccountCreated } from "@/lib/email/send";

/**
 * Fires the account-created email after an email+password signup.
 *
 * A server action rather than a client call because the Resend key is
 * server-only. Best-effort by design: a mail failure must never block someone
 * from getting into their account, so this returns void and swallows errors
 * (the attempt is still recorded in email_log by the send layer).
 */
export async function notifyAccountCreated(
  email: string,
  firstName?: string,
): Promise<void> {
  if (!email?.includes("@")) return;
  await sendAccountCreated(email, firstName).catch(() => undefined);
}
