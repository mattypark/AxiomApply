"use client";

import { createBrowserClient } from "@supabase/ssr";
import { hasSupabaseEnv, supabaseAnonKey, supabaseUrl } from "./env";

/** Browser client — null when Supabase isn't configured yet. */
export function getBrowserSupabase() {
  if (!hasSupabaseEnv) return null;
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
