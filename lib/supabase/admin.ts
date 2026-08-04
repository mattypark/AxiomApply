import "server-only";

import { createClient } from "@supabase/supabase-js";
import { hasSupabaseEnv, supabaseUrl } from "./env";

/**
 * Service-role client. Bypasses RLS — import ONLY from route handlers and
 * server actions that sit behind requireAdmin() (or the cron secret).
 * The `server-only` import makes any client-bundle leak a build error.
 */
export function getAdminSupabase() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!hasSupabaseEnv || serviceKey.length === 0) return null;
  return createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
