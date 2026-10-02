import "server-only";

import { supabaseOutreachSource, type OutreachSource } from "./supabase";

/**
 * Where the outreach desk's data comes from. Supabase today; the D1 adapter
 * slots in here after the Cloudflare move, like getHqSource().
 */
export function getOutreachSource(): OutreachSource {
  return supabaseOutreachSource();
}
