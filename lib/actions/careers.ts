"use server";

import { getRole, CAREERS_EMAIL } from "@/lib/careers";
import { postCareerToSheet } from "@/lib/careers-submit";
import { getServerSupabase } from "@/lib/supabase/server";

export type CareerResult = { ok: boolean; error?: string };

/**
 * Apply to a role at Axiom Pathways.
 *
 * Supabase is the record; the Sheet is a mirror the ops side reads. If neither
 * is configured the applicant is told to email rather than handed a false
 * "got it" — a dropped application is worse than a visible dead end.
 */
export async function submitCareerApplication(
  _prev: CareerResult | null,
  formData: FormData,
): Promise<CareerResult> {
  const value = (key: string) => String(formData.get(key) ?? "").trim();

  const roleSlug = value("role_slug");
  const role = getRole(roleSlug);
  if (!role) {
    return { ok: false, error: "That role is no longer listed." };
  }

  const name = value("name");
  const email = value("email");
  const links = value("links");
  const why = value("why");

  if (!name || !email || !links || !why) {
    return { ok: false, error: "Name, email, links, and why are all required." };
  }

  const row = {
    role_slug: role.slug,
    role_title: role.title,
    name,
    email,
    phone: value("phone") || null,
    location: value("location") || null,
    links,
    why,
    shipped: value("shipped") || null,
    availability: value("availability") || null,
  };

  const supabase = await getServerSupabase();
  if (!supabase) {
    return {
      ok: false,
      error: `Applications aren't wired up yet — email ${CAREERS_EMAIL} instead.`,
    };
  }

  const { error } = await supabase.from("career_applications").insert(row);
  if (error) {
    return { ok: false, error: "Couldn't send that just now — try again in a moment." };
  }

  // Mirror to the Sheet, best effort. A Google failure must not cost the
  // applicant a submission that Supabase already accepted.
  const sheet = await postCareerToSheet(
    Object.fromEntries(
      Object.entries(row).map(([key, val]) => [key, val ?? ""]),
    ),
  );
  if (!sheet.ok && sheet.reason !== "not-configured") {
    console.error("[careers] sheet mirror failed:", sheet.reason, role.slug);
  }

  return { ok: true };
}
