import { getServerSupabase } from "@/lib/supabase/server";
import { landingFor, safeNext } from "@/lib/auth-landing";

/**
 * Where email + password sign-in goes once the browser has its session:
 * the same landing rules as /auth/callback, so an admin lands on HQ whichever
 * way they signed in.
 *
 * The redirect is relative on purpose. The sign-in happened in this browser,
 * on this origin, so the session cookie only exists here: an absolute URL
 * built from the site setting would send a local sign-in to production,
 * signed out. A relative Location can't leave the origin, and it doesn't
 * trust the proxy's idea of the host either.
 */
function go(path: string) {
  return new Response(null, { status: 307, headers: { Location: path, "Cache-Control": "no-store" } });
}

export async function GET(request: Request) {
  const supabase = await getServerSupabase();
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;
  if (!supabase || !user) return go("/auth");
  const next = safeNext(new URL(request.url).searchParams.get("next"));
  return go(await landingFor(supabase, user, next));
}
