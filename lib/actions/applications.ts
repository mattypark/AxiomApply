"use server";

import { getAdminSupabase } from "@/lib/supabase/admin";
import { getServerSupabase } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { APPLY_STEPS } from "@/lib/apply-contract";
import { postStartupToSheet } from "@/lib/startup-submit";
import { FIELDS } from "@/types/database";
import {
  sendApplicationReceived,
  sendInternWelcome,
  sendStartupReceived,
} from "@/lib/email/send";

/**
 * The Supabase half of the dual write.
 *
 * The Google Apps Script webhook stays the primary destination and is fired
 * from the browser exactly as it always has been (lib/apply-submit.ts). This
 * action is the SECOND write: the same answers land in public.applications so
 * status is queryable and decision emails can be segmented and suppressed.
 *
 * It is deliberately best-effort. A failure here must never surface to the
 * applicant or block the webhook — the Sheet still has their application.
 *
 * Service role is used because the form works signed-out: RLS only allows an
 * insert when auth.uid() matches user_id, and most applicants have no account
 * at submit time. Only contract-known fields are copied, so nothing arbitrary
 * from the client reaches a column.
 */

/** Columns in public.applications that map 1:1 to a contract field name. */
const CONTRACT_COLUMNS = new Set(
  APPLY_STEPS.flatMap((step) => step.fields)
    .filter((f) => f.type !== "file")
    .map((f) => f.name),
);

export type RecordResult = { ok: boolean };

export async function recordApplication(
  answers: Record<string, string>,
): Promise<RecordResult> {
  const email = answers.email?.trim();
  if (!email) return { ok: false };

  const supabase = getAdminSupabase();
  if (!supabase) return { ok: false };

  const row: Record<string, unknown> = { email: email.toLowerCase() };
  for (const [key, value] of Object.entries(answers)) {
    if (!CONTRACT_COLUMNS.has(key)) continue;
    const trimmed = value?.trim();
    if (trimmed) row[key] = trimmed;
  }
  row.email = email.toLowerCase();

  // Link to the account when there is one; historical rows link by email.
  const user = await getUser();
  if (user) row.user_id = user.id;

  // Everything the applicant sent, including keys this schema does not model,
  // so a future column can be backfilled without re-asking anyone.
  row.sheet_row = answers;

  const { error } = await supabase.from("applications").insert(row);

  // "Got it." — the one email that must never wait on a human. Failure here is
  // logged to email_log and swallowed; the application is already recorded.
  if (!error) {
    await sendApplicationReceived(email, { firstName: answers.name }).catch(
      () => undefined,
    );
  }

  return { ok: !error };
}

/**
 * /onboarding is the same engine as /apply, so a signed-in applicant finishing
 * the intern application is also finishing onboarding. Fill the profile from
 * what they already told us rather than asking the same things twice.
 *
 * Signed-out applicants simply skip this — the application still lands.
 */
export async function syncInternProfile(
  answers: Record<string, string>,
): Promise<void> {
  const supabase = await getServerSupabase();
  if (!supabase) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const interest = answers.interest?.trim();
  const preferredFields = FIELDS.filter((f) => f === interest);

  // Welcome fires on the transition into the intern role, not on every save,
  // so re-editing a profile never re-sends it.
  const { data: before } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const isNewIntern = (before as { role?: string | null } | null)?.role !== "intern";

  await supabase
    .from("profiles")
    .update({
      role: "intern",
      school: answers.school?.trim() || null,
      grade: answers.grade?.trim() || null,
      ...(preferredFields.length > 0
        ? { preferred_fields: preferredFields }
        : {}),
      looking_for: answers.startup_role?.trim() || null,
      github: answers.github?.trim() || null,
      linkedin: answers.linkedin?.trim() || null,
      social: answers.instagram?.trim() || answers.other_link?.trim() || null,
    })
    .eq("id", user.id);

  if (isNewIntern && user.email) {
    await sendInternWelcome(user.email, answers.name).catch(() => undefined);
  }
}

export type StartupApplicationResult = { ok: boolean; error?: string };

/**
 * The startup side. There is no frozen webhook here — it lands in
 * startup_inquiries, with the long-form answers kept intact in `message`
 * so nothing an applicant wrote is dropped before the schema catches up.
 */
export async function submitStartupApplication(
  answers: Record<string, string>,
): Promise<StartupApplicationResult> {
  const company = answers.company?.trim();
  const name = answers.contact_name?.trim();
  const email = answers.contact_email?.trim();

  if (!company || !name || !email) {
    return { ok: false, error: "Company, name, and email are required." };
  }

  const supabase = getAdminSupabase();
  if (!supabase) {
    return {
      ok: false,
      error: "Not connected yet — email matthew@axiompathways.org instead.",
    };
  }

  const transcript = Object.entries(answers)
    .filter(([, value]) => value?.trim())
    .map(([key, value]) => `${key}: ${value.trim()}`)
    .join("\n");

  const { error } = await supabase.from("startup_inquiries").insert({
    company,
    name,
    email,
    role_interest: answers.role_need?.trim() || null,
    message: transcript,
  });

  if (error) {
    return { ok: false, error: "That did not send. Try once more." };
  }

  // Second destination: the startups spreadsheet, which is where Matthew
  // actually works the queue. Its own Sheet and its own Apps Script — the
  // intern webhook is untouched. Never allowed to fail the submission: the
  // row is already in Postgres, and Postgres is what the product reads.
  const sheet = await postStartupToSheet(answers);
  if (!sheet.ok && sheet.reason !== "not-configured") {
    console.error(`Startup Sheet write failed: ${sheet.reason}`);
  }

  await sendStartupReceived(email, {
    contactFirstName: name,
    company,
  }).catch(() => undefined);

  // Signed in via /onboarding → this application IS their onboarding. The
  // account stays locked until Matthew flips profiles.approved by hand.
  const scoped = await getServerSupabase();
  if (scoped) {
    const {
      data: { user },
    } = await scoped.auth.getUser();
    if (user) {
      await scoped
        .from("profiles")
        .update({
          role: "startup",
          company,
          linkedin: answers.linkedin?.trim() || null,
          social: answers.socials?.trim() || null,
          looking_for: answers.role_need?.trim() || null,
        })
        .eq("id", user.id);
    }
  }

  return { ok: true };
}
