import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { hasSupabaseEnv, supabaseAnonKey, supabaseUrl } from "./env";

/**
 * Anon server client (RLS enforced) — the one public pages use, so
 * anonymous-read policies are actually exercised. Null when unconfigured.
 */
export async function getServerSupabase() {
  if (!hasSupabaseEnv) return null;
  const cookieStore = await cookies();
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(
        cookiesToSet: { name: string; value: string; options: CookieOptions }[],
      ) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component — safe to ignore when middleware
          // is refreshing sessions.
        }
      },
    },
  });
}
