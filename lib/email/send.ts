import "server-only";

import { getAdminSupabase } from "@/lib/supabase/admin";
import { isEmailConfigured, sendEmail, type MailClass } from "@/lib/email/client";
import { MARKETING_TOPIC, unsubscribeUrl } from "@/lib/email/unsubscribe";
import * as templates from "@/lib/email/templates";

/**
 * The send layer: suppression check → send → log.
 *
 * Every caller goes through `deliver`, so there is exactly one place that can
 * send mail and exactly one place that decides whether an address is
 * suppressed. Failures are returned, never thrown — an email problem must not
 * take down an application submission.
 */

type DeliverInput = {
  to: string;
  template: string;
  mailClass: MailClass;
  subject: string;
  text: string;
  unsubscribeUrl?: string;
};

export type DeliverResult = { ok: boolean; skipped?: string; error?: string; id?: string };

async function isSuppressed(email: string, mailClass: MailClass): Promise<boolean> {
  const supabase = getAdminSupabase();
  if (!supabase) return false;

  // Transactional mail is only stopped by a hard bounce or a complaint. A
  // marketing unsubscribe never blocks someone's own application updates.
  const topics = mailClass === "marketing" ? [MARKETING_TOPIC, "all"] : ["all"];

  const { data } = await supabase
    .from("email_optouts")
    .select("id")
    .eq("email", email.toLowerCase())
    .in("topic", topics)
    .limit(1);

  return (data?.length ?? 0) > 0;
}

async function log(
  input: DeliverInput,
  result: { ok: boolean; id?: string; error?: string },
): Promise<void> {
  const supabase = getAdminSupabase();
  if (!supabase) return;

  await supabase.from("email_log").insert({
    email: input.to.toLowerCase(),
    template: input.template,
    mail_class: input.mailClass,
    provider_id: result.id ?? null,
    ok: result.ok,
    error: result.error ?? null,
  });
}

async function deliver(input: DeliverInput): Promise<DeliverResult> {
  if (!input.to?.includes("@")) return { ok: false, skipped: "no-address" };
  if (!isEmailConfigured()) return { ok: false, skipped: "email-not-configured" };
  if (await isSuppressed(input.to, input.mailClass)) {
    return { ok: false, skipped: "suppressed" };
  }

  const result = await sendEmail({
    to: input.to,
    subject: input.subject,
    text: input.text,
    mailClass: input.mailClass,
    unsubscribeUrl: input.unsubscribeUrl,
  });

  await log(input, result);
  return { ok: result.ok, error: result.error, id: result.id };
}

/**
 * Send copy that was rendered earlier and reviewed since.
 *
 * The lifecycle senders below render from `templates` at the moment of
 * sending, which is right for mail triggered by an event. Decision mail is
 * different: it is rendered in bulk, read on /admin/applications, and sent
 * later by a human who is approving the exact words they read. Re-rendering at
 * send time would mean an edit to templates.ts between review and click
 * silently changes what ships, so the queue stores the text and this sends it.
 *
 * `template` is still recorded, so email_log stays queryable by kind.
 */
export function sendPrepared(input: {
  to: string;
  template: string;
  subject: string;
  text: string;
}): Promise<DeliverResult> {
  return deliver({ ...input, mailClass: "transactional" });
}

/* ------------------------------------------------------------------ */
/* the lifecycle sends                                                 */
/* ------------------------------------------------------------------ */

export function sendInternWelcome(to: string, firstName?: string) {
  const unsub = unsubscribeUrl(to);
  const email = templates.internWelcome({ firstName, unsubscribeUrl: unsub });
  return deliver({
    to,
    template: "internWelcome",
    // Contains "browse the feed / start a track" nudges, so it is treated as
    // marketing: opt-out honoured, List-Unsubscribe headers attached.
    mailClass: "marketing",
    unsubscribeUrl: unsub,
    ...email,
  });
}

export function sendAccountCreated(to: string, firstName?: string) {
  return deliver({
    to,
    template: "accountCreated",
    mailClass: "transactional",
    ...templates.accountCreated({ firstName }),
  });
}

export function sendApplicationReceived(
  to: string,
  vars: { firstName?: string; submittedDate?: string },
) {
  const submittedDate =
    vars.submittedDate ??
    new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  return deliver({
    to,
    template: "applicationReceived",
    mailClass: "transactional",
    ...templates.applicationReceived({ firstName: vars.firstName, submittedDate }),
  });
}

export function sendAccepted(to: string, vars: templates.MatchVars) {
  return deliver({
    to,
    template: "accepted",
    mailClass: "transactional",
    ...templates.accepted(vars),
  });
}

export function sendNotSelected(to: string, vars: templates.NotSelectedVars) {
  return deliver({
    to,
    template: "notSelected",
    mailClass: "transactional",
    ...templates.notSelected(vars),
  });
}

export function sendWaitlisted(to: string, vars: templates.WaitlistedVars) {
  return deliver({
    to,
    template: "waitlisted",
    // News about the recipient's own application, so a marketing unsubscribe
    // must not swallow it — same call as sendAccepted and sendNotSelected.
    mailClass: "transactional",
    ...templates.waitlisted(vars),
  });
}

export function sendStartupApproved(
  to: string,
  vars: { contactFirstName?: string; company: string; turnaround?: string },
) {
  return deliver({
    to,
    template: "startupApproved",
    mailClass: "transactional",
    ...templates.startupApproved({
      contactFirstName: vars.contactFirstName,
      company: vars.company,
      turnaround: vars.turnaround ?? "a week",
    }),
  });
}

export function sendStartupReceived(
  to: string,
  vars: { contactFirstName?: string; company: string },
) {
  return deliver({
    to,
    template: "startupReceived",
    mailClass: "transactional",
    ...templates.startupReceived(vars),
  });
}

export function sendChapterReceived(
  to: string,
  vars: { firstName?: string; school: string },
) {
  return deliver({
    to,
    template: "chapterReceived",
    mailClass: "transactional",
    ...templates.chapterReceived(vars),
  });
}
