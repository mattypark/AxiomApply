import { redirect } from "next/navigation";
import { StartupTabBar } from "@/components/startup/StartupTabBar";
import { GlassPanel } from "@/components/glass/GlassPanel";
import { getProfile } from "@/lib/auth";
import { hasChapter as getHasChapter } from "@/lib/chapters";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { signOut } from "@/lib/actions/profile";

// Startup-side shell. Gated: startups are verified by hand — the dashboard
// stays locked until Matthew flips profiles.approved in Supabase.
export default async function StartupLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  if (hasSupabaseEnv) {
    const profile = await getProfile();
    if (!profile) redirect("/onboarding");
    if (profile.role !== "startup") redirect("/home");

    if (!profile.approved) {
      return (
        <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col items-center justify-center gap-6 px-5 text-center">
          <GlassPanel specular className="flex flex-col items-center gap-4 p-10">
            <span className="chip chip-forest">
              {profile.company ?? "Your startup"}
            </span>
            <h1 className="text-2xl font-semibold tracking-tight text-ink">
              Under review.
            </h1>
            <p className="max-w-[40ch] text-[0.95rem] leading-relaxed text-muted">
              We verify every startup by hand — that&apos;s what keeps the
              network real. You&apos;ll get an email the moment you&apos;re
              approved, usually same-day.
            </p>
            <p className="text-[0.88rem] text-muted">
              Want to speed it up?{" "}
              <a
                href="mailto:matthew@axiompathways.org?subject=Startup%20verification"
                className="font-medium text-forest hover:text-forest-deep"
              >
                Email us directly →
              </a>
            </p>
            <form action={signOut}>
              <button
                type="submit"
                className="mt-2 text-[0.85rem] text-muted transition-colors hover:text-ink"
              >
                Sign out
              </button>
            </form>
          </GlassPanel>
        </main>
      );
    }
  }

  // A founder may also run a school chapter — the dock has to carry the way
  // across, because chapters are additive rather than a different role.
  const runsChapter = await getHasChapter();

  return (
    <div className="min-h-dvh px-5 pt-10 pb-36 sm:px-8">
      {children}
      <StartupTabBar hasChapter={runsChapter} />
    </div>
  );
}
