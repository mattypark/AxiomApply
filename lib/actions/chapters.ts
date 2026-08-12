"use server";

import { revalidatePath } from "next/cache";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";

const STATUSES = [
  "applied",
  "review",
  "approved",
  "rejected",
  "withdrawn",
] as const;

type Status = (typeof STATUSES)[number];

function isStatus(value: unknown): value is Status {
  return STATUSES.includes(value as Status);
}

/**
 * Set a chapter's status.
 *
 * Approval is what unlocks Chapter HQ, so this is admin-only and re-checks the
 * gate itself — a server action is a public endpoint, and the /admin layout
 * guarding the page it is called from does not guard the action.
 */
export async function setChapterStatus(formData: FormData): Promise<void> {
  const gate = await requireAdmin();
  if (!gate.ok) return;

  const id = String(formData.get("id") ?? "");
  const status = formData.get("status");
  if (!id || !isStatus(status)) return;

  const supabase = getAdminSupabase();
  if (!supabase) return;

  const { error } = await supabase
    .from("chapter_applications")
    .update({ status })
    .eq("id", id);
  if (error) throw new Error(`Chapter status update failed: ${error.message}`);

  revalidatePath("/admin/chapters");
}
