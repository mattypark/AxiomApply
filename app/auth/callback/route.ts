import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next");
  const next = nextParam && nextParam.startsWith("/") ? nextParam : "/home";

  const supabase = await getServerSupabase();
  if (!supabase) return NextResponse.redirect(`${origin}/`);

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(`${origin}/auth?error=auth`);
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

    const role = profile?.role as "intern" | "startup" | null | undefined;
    if (!role) {
      // No role yet — send them back to wherever they came from, query
      // string intact. OAuth started inside an application gate arrives as
      // next=/onboarding?side=..., and dropping it dumped people back on
      // the picker they had already answered.
      return NextResponse.redirect(
        `${origin}${nextParam?.startsWith("/") ? nextParam : "/onboarding"}`,
      );
    }
    if (role === "startup") {
      return NextResponse.redirect(`${origin}/startup/home`);
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
