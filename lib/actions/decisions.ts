"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { sendPrepared } from "@/lib/email/send";
import {
  BATCH_SIZE,
  firstNameOf,
  renderDecisionCopy,
  type CycleFacts,
  type QueueTemplate,
} from "@/lib/email/decision-copy";

/**
 * Decision mail: build a queue, look at it, send it in batches.
 *
 * Three separate human actions, deliberately. Nothing here runs on a
 * schedule, nothing sends as a side effect of the Sheet push, and
 * `buildQueue` mails nobody — it only writes rows a person can read first.
 *
 * Who gets what, from applications.status:
 *   rejected            → notSelected
 *   waitlist, applied   → waitlisted   ("applied" = nobody has decided yet)
 *   accepted            → nothing. Matthew sends those himself; the accepted
 *                         template needs startup, role, founder and an accept
 *                         link that the Sheet does not carry, and half-filled
 *                         copy is worse than a personal email.
 *   withdrawn           → nothing.
 */

async function adminClientOrThrow() {
  const gate = await requireAdmin();
  if (!gate.ok) throw new Error("Not authorized");
  const supabase = getAdminSupabase();
  if (!supabase) throw new Error("Supabase service role not configured");
  return supabase;
}

/**
 * Stage every undecided and rejected applicant, rendering the copy now and
 * storing it, so what gets reviewed is what gets sent.
 *
 * Re-running is safe and is the normal way to pick up a fresh Sheet push:
 * anyone already queued or already mailed is left alone.
 */
export async function buildQueue(formData: FormData) {
  const supabase = await adminClientOrThrow();

  const facts: CycleFacts = {
    applicantCount: String(formData.get("applicantCount") ?? "").trim(),
    matchCount: String(formData.get("matchCount") ?? "").trim(),
    season: String(formData.get("season") ?? "").trim(),
    nextCycleDate: String(formData.get("nextCycleDate") ?? "").trim(),
  };

  // These land verbatim in copy that a few hundred people read. A blank one
  // would ship as "we had  applications and  seats".
  for (const [key, value] of Object.entries(facts)) {
    if (!value) throw new Error(`${key} is required — it appears in the email copy`);
  }

  const { data: applications, error } = await supabase
    .from("applications")
    .select("id, email, name, status, submitted_at")
    .in("status", ["rejected", "waitlist", "applied"])
    .order("submitted_at", { ascending: false });

  if (error) throw new Error(`Could not read applications: ${error.message}`);

  // Already queued or already sent, by (email, template) — the same pair the
  // unique index guards. The index is the real backstop; this check is what
  // keeps a re-run from being 600 insert errors.
  const { data: queued } = await supabase.from("email_queue").select("email, template");
  const taken = new Set((queued ?? []).map((q) => `${String(q.email).toLowerCase()}|${q.template}`));

  const rows: Record<string, unknown>[] = [];
  const seen = new Set<string>();

  for (const app of applications ?? []) {
    const email = String(app.email ?? "").toLowerCase().trim();
    if (!email.includes("@")) continue;

    // Ordered newest first, so the first row wins for anyone who applied twice.
    if (seen.has(email)) continue;
    seen.add(email);

    const template: QueueTemplate = app.status === "rejected" ? "notSelected" : "waitlisted";
    if (taken.has(`${email}|${template}`)) continue;

    const name = firstNameOf(app.name as string | null);
    const copy = renderDecisionCopy(template, facts, name);

    rows.push({
      application_id: app.id,
      email,
      first_name: name ?? null,
      template,
      subject: copy.subject,
      body: copy.text,
    });
  }

  for (let i = 0; i < rows.length; i += 200) {
    const batch = rows.slice(i, i + 200);
    const { error: insertError } = await supabase.from("email_queue").insert(batch);
    if (!insertError) continue;

    // One bad row must not drop the other 199 — retry the batch individually.
    // A row that collides with the unique index is already queued or already
    // sent, which is the outcome we want anyway.
    for (const row of batch) {
      await supabase.from("email_queue").insert(row);
    }
  }

  revalidatePath("/admin/applications");
}

/**
 * Send the next batch. The only function in the repo that puts decision mail
 * on the wire, and it runs when someone clicks it.
 *
 * Sends are sequential on purpose: Resend rate-limits, and a burst that gets
 * throttled halfway leaves rows in an unclear state. 150 sequential sends take
 * well under the route's time budget.
 */
export async function sendNextBatch(formData: FormData) {
  const supabase = await adminClientOrThrow();

  const template = String(formData.get("template") ?? "");
  if (template !== "notSelected" && template !== "waitlisted") {
    throw new Error("Unknown template");
  }

  const { data: pending, error } = await supabase
    .from("email_queue")
    .select("id, email, subject, body, template")
    .eq("status", "pending")
    .eq("template", template)
    .order("queued_at", { ascending: true })
    .limit(BATCH_SIZE);

  if (error) throw new Error(`Could not read the queue: ${error.message}`);

  for (const row of pending ?? []) {
    const result = await sendPrepared({
      to: row.email as string,
      template: row.template as string,
      subject: row.subject as string,
      text: row.body as string,
    });

    await supabase
      .from("email_queue")
      .update({
        status: result.ok ? "sent" : result.skipped ? "skipped" : "failed",
        reason: result.skipped ?? result.error ?? null,
        provider_id: result.id ?? null,
        sent_at: new Date().toISOString(),
      })
      .eq("id", row.id);
  }

  revalidatePath("/admin/applications");
}

/**
 * Clear pending rows so a queue built with wrong numbers can be rebuilt.
 * Only ever touches `pending` — anything already sent stays on the record.
 */
export async function discardPending() {
  const supabase = await adminClientOrThrow();
  await supabase.from("email_queue").delete().eq("status", "pending");
  revalidatePath("/admin/applications");
}
