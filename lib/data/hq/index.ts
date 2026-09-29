import "server-only";

import { supabaseHqSource } from "./supabase";
import type { HqSource } from "./types";

/**
 * The one place that decides where HQ's data comes from. Supabase today;
 * after the Cloudflare move this returns the D1 adapter, and nothing that
 * calls it changes.
 */
export function getHqSource(): HqSource {
  return supabaseHqSource();
}
