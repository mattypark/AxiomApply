"use server";

import { getServerSupabase } from "@/lib/supabase/server";

export type InquiryResult = { ok: boolean; error?: string };

/** Startup inquiry / role posting — RLS allows anonymous insert. */
export async function submitInquiry(
  _prev: InquiryResult | null,
  formData: FormData,
): Promise<InquiryResult> {
  const supabase = await getServerSupabase();
  if (!supabase) {
    return { ok: false, error: "Not connected yet — email matthew@axiompathways.org instead." };
  }

  const company = String(formData.get("company") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const roleInterest = String(formData.get("role_interest") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!company || !name || !email) {
    return { ok: false, error: "Company, name, and email are required." };
  }

  const { error } = await supabase.from("startup_inquiries").insert({
    company,
    name,
    email,
    role_interest: roleInterest || null,
    message: message || null,
  });
  if (error) {
    return { ok: false, error: "Couldn't send that just now — try again in a moment." };
  }
  return { ok: true };
}
