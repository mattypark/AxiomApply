import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site-url";
import { landingFor, safeNext } from "@/lib/auth-landing";

/**
 * OAuth / magic-link landing.
 *
 * Every redirect below is built from `getSiteUrl()`, never from
 * `new URL(request.url).origin`. Behind Vercel's proxy that origin is the one
 * the server process sees, which can be an internal host or `localhost:3000` —
 * redirecting to it is what sent signed-in users to localhost in production.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const site = await getSiteUrl(origin);
  const requested = safeNext(searchParams.get("next"));

  const supabase = await getServerSupabase();
  if (!supabase) return NextResponse.redirect(`${site}/`);

  const code = searchParams.get("code");
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    // Most often: the sign-in started on another address (localhost, a
    // preview URL) whose half of the handshake this site can't see.
    if (error) return NextResponse.redirect(`${site}/auth/error`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(`${site}/auth/error`);

  return NextResponse.redirect(`${site}${await landingFor(supabase, user, requested)}`);
}
