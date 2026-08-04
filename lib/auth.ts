import { getServerSupabase } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

export async function getUser() {
  const supabase = await getServerSupabase();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getProfile(): Promise<Profile | null> {
  const supabase = await getServerSupabase();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  return (data as Profile) ?? null;
}

/**
 * Admin gate for /admin and content-write server code.
 * Requires profiles.is_admin AND (belt-and-suspenders) membership in
 * the server-side ADMIN_EMAILS allowlist when that env is set.
 */
export async function requireAdmin(): Promise<
  { ok: true; profile: Profile; email: string } | { ok: false }
> {
  const supabase = await getServerSupabase();
  if (!supabase) return { ok: false };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return { ok: false };

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  const profile = data as Profile | null;
  if (!profile?.is_admin) return { ok: false };

  const allow = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (allow.length > 0 && !allow.includes(user.email.toLowerCase())) {
    return { ok: false };
  }
  return { ok: true, profile, email: user.email };
}
