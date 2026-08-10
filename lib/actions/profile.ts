"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getServerSupabase } from "@/lib/supabase/server";
import { supabaseUrl } from "@/lib/supabase/env";

export async function setRole(formData: FormData) {
  const role = formData.get("role");
  const nextRaw = formData.get("next");
  const next =
    typeof nextRaw === "string" && nextRaw.startsWith("/") ? nextRaw : "/home";
  if (role !== "intern" && role !== "startup") redirect("/");

  const supabase = await getServerSupabase();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({ role }).eq("id", user.id);
    }
  }
  redirect(role === "startup" ? "/startup/home" : next);
}

/** Intern onboarding: light — role + what they're looking for. */
export async function completeInternOnboarding(formData: FormData) {
  const supabase = await getServerSupabase();
  if (!supabase) redirect("/");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signup");

  const { error } = await supabase
    .from("profiles")
    .update({
      role: "intern",
      preferred_seasons: formData.getAll("preferred_seasons").map(String),
      preferred_fields: formData.getAll("preferred_fields").map(String),
      looking_for: String(formData.get("looking_for") ?? "").trim() || null,
      github: String(formData.get("github") ?? "").trim() || null,
      linkedin: String(formData.get("linkedin") ?? "").trim() || null,
      social: String(formData.get("social") ?? "").trim() || null,
    })
    .eq("id", user.id);
  // Surface failures loudly — a silent failure here strands the user roleless.
  if (error) throw new Error(`Profile save failed: ${error.message}`);

  revalidatePath("/account");
  redirect("/home");
}

/** Startup onboarding: longer form; account stays locked until Matthew
 *  flips profiles.approved in Supabase (manual verification). */
export async function completeStartupOnboarding(formData: FormData) {
  const supabase = await getServerSupabase();
  if (!supabase) redirect("/");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signup");

  const company = String(formData.get("company") ?? "").trim();
  const linkedin = String(formData.get("linkedin") ?? "").trim();
  const social = String(formData.get("social") ?? "").trim();
  const lookingFor = String(formData.get("looking_for") ?? "").trim();
  if (!company || !linkedin || !lookingFor) redirect("/onboarding");

  const { error } = await supabase
    .from("profiles")
    .update({
      role: "startup",
      company,
      linkedin,
      social: social || null,
      looking_for: lookingFor,
    })
    .eq("id", user.id);
  if (error) throw new Error(`Startup profile save failed: ${error.message}`);

  redirect("/startup/home");
}

/**
 * Persist a profile photo that the browser already uploaded to Storage.
 *
 * A server action is a public endpoint, so the URL is not taken on faith: it
 * must live under this project's own avatars bucket AND under the caller's own
 * uid folder. That makes the worst case "a user points at their own file",
 * never "a user points the profile at an arbitrary host".
 */
export async function setAvatarUrl(url: string): Promise<{ ok: boolean }> {
  const supabase = await getServerSupabase();
  if (!supabase) return { ok: false };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  const expectedPrefix = `${supabaseUrl}/storage/v1/object/public/avatars/${user.id}/`;
  if (!url.startsWith(expectedPrefix)) return { ok: false };

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: url })
    .eq("id", user.id);
  if (error) return { ok: false };

  revalidatePath("/account");
  revalidatePath("/home");
  return { ok: true };
}

export async function updateProfile(formData: FormData) {
  const supabase = await getServerSupabase();
  if (!supabase) return;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth?next=/account");

  const seasons = formData.getAll("preferred_seasons").map(String);
  const fields = formData.getAll("preferred_fields").map(String);

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: String(formData.get("display_name") ?? "").trim() || null,
      phone: String(formData.get("phone") ?? "").trim() || null,
      school: String(formData.get("school") ?? "").trim() || null,
      grade: String(formData.get("grade") ?? "").trim() || null,
      preferred_seasons: seasons,
      preferred_fields: fields,
      experience: String(formData.get("experience") ?? "").trim() || null,
      github: String(formData.get("github") ?? "").trim() || null,
      linkedin: String(formData.get("linkedin") ?? "").trim() || null,
      social: String(formData.get("social") ?? "").trim() || null,
    })
    .eq("id", user.id);
  if (error) throw new Error(`Account save failed: ${error.message}`);

  revalidatePath("/account");
}

export async function signOut() {
  const supabase = await getServerSupabase();
  if (supabase) await supabase.auth.signOut();
  redirect("/");
}

/**
 * Mark an account as an intern.
 *
 * Landing on /home is itself the answer to "which side are you on?", so a
 * signed-in visitor with no role gets one rather than being bounced back to
 * the picker. Only ever fills a blank — an existing role, including startup,
 * is never overwritten.
 */
export async function claimInternRole(userId: string): Promise<void> {
  const supabase = await getServerSupabase();
  if (!supabase) return;

  await supabase
    .from("profiles")
    .update({ role: "intern" })
    .eq("id", userId)
    .is("role", null);
}
