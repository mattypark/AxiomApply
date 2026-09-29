import "server-only";

import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { hqPath } from "@/lib/hq-gate";

/**
 * Where someone lands right after signing in, whichever way they did it:
 * Google or GitHub (/auth/callback) or email and password (/auth/continue).
 *
 * In order:
 *   1. An admin goes to HQ. Matthew signs in to read applications, so that
 *      is the page he wants, unless he's testing the application itself.
 *   2. An explicit `next` (where the person was, usually mid-application).
 *   3. By role: no role → the side picker; startup → its home; else /home.
 */

/** Admin = profiles.is_admin AND on the ADMIN_EMAILS allowlist, as requireAdmin() checks. */
async function isAdmin(supabase: SupabaseClient, user: User): Promise<boolean> {
  if (!user.email) return false;
  const { data } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  if (!data?.is_admin) return false;
  const allow = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  return allow.length === 0 || allow.includes(user.email.toLowerCase());
}

/** Paths an admin may be heading to on purpose; everything else sends them to HQ. */
const ADMIN_KEEPS_NEXT = ["/onboarding", "/admin", "/hq"];

export async function landingFor(supabase: SupabaseClient, user: User, requested: string | null): Promise<string> {
  if (await isAdmin(supabase, user)) {
    const hq = hqPath();
    const keep = requested && ADMIN_KEEPS_NEXT.some((prefix) => requested.startsWith(prefix));
    if (hq && !keep) return hq;
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  let role = profile?.role as "intern" | "startup" | null | undefined;

  // Someone who already applied should never be asked "which side are you
  // on?" again. Most applications are filed signed-out, so the account can
  // exist with no role while an application sits against the same email —
  // which sent returning applicants back to the picker instead of home.
  if (!role && user.email) {
    const admin = getAdminSupabase();
    if (admin) {
      const { data: application } = await admin
        .from("applications")
        .select("id")
        .ilike("email", user.email.toLowerCase())
        .limit(1)
        .maybeSingle();
      if (application) {
        await admin.from("profiles").update({ role: "intern" }).eq("id", user.id);
        role = "intern";
      }
    }
  }

  // An explicit `next` is where the person actually was — mid-application,
  // usually. It wins over the role defaults below, which are only for
  // arrivals with nowhere particular to return to.
  if (requested) return requested;
  if (!role) return "/onboarding";
  if (role === "startup") return "/startup/home";
  return "/home";
}

/** A `next` we'll follow: a path on this site, never another origin. */
export function safeNext(value: string | null): string | null {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : null;
}
