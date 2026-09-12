import { getServerSupabase } from "@/lib/supabase/server";

/**
 * The number the feed banner leads with.
 *
 * It used to be the string "12,597" typed into two components, which meant the
 * headline fact on the landing page drifted away from the table the moment the
 * cron ran. This reads it.
 *
 * The fallback is that same number rather than zero: with no Supabase env the
 * whole site degrades to copy, and "0 live listings" is a worse lie than a
 * slightly stale one.
 */
const FALLBACK = 12597;

export async function getInternshipCount(): Promise<number> {
  const supabase = await getServerSupabase();
  if (!supabase) return FALLBACK;

  const { count, error } = await supabase
    .from("internships")
    .select("id", { count: "exact", head: true });

  if (error || !count) return FALLBACK;
  return count;
}
