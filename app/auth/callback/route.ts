import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { getSiteUrl } from "@/lib/site-url";

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

  const code = searchParams.get("code");
  const nextParam = searchParams.get("next");

  // An explicit `next` is where the person actually was — mid-application,
  // usually. It wins over every role-based default below; those are only for
  // arrivals with nowhere particular to return to. Overriding it is what sent
  // people who signed in from inside the form back to the home page.
  const requested =
    nextParam && nextParam.startsWith("/") ? nextParam : null;
  const next = requested ?? "/home";

  const supabase = await getServerSupabase();
  if (!supabase) return NextResponse.redirect(`${site}/`);

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      // /auth redirects to the welcome page now, so send them there directly
      // with the error visible rather than through a bounce.
      return NextResponse.redirect(`${site}/?error=auth`);
    }
  }

  // Account exists — now route by role. No role yet → onboarding asks
  // "which side are you on?" (auth always comes first).
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

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
          await admin
            .from("profiles")
            .update({ role: "intern" })
            .eq("id", user.id);
          role = "intern";
        }
      }
    }

    if (requested) {
      return NextResponse.redirect(`${site}${requested}`);
    }
    if (!role) {
      return NextResponse.redirect(`${site}/onboarding`);
    }
    if (role === "startup") {
      return NextResponse.redirect(`${site}/startup/home`);
    }
  }

  return NextResponse.redirect(`${site}${next}`);
}
