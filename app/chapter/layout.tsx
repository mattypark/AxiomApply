import { redirect } from "next/navigation";
import { ChapterTabBar } from "@/components/chapter/ChapterTabBar";
import { GlassPanel } from "@/components/glass/GlassPanel";
import { getMyChapter } from "@/lib/chapters";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { signOut } from "@/lib/actions/profile";

/**
 * Chapter-side shell.
 *
 * Gated on having a chapter application, NOT on profiles.role — a chapter lead
 * is very often also an intern, and checking the role the way the startup
 * shell does would lock exactly those people out of their own chapter.
 *
 * Chapters are approved one at a time by hand, so the dashboard stays closed
 * until the row reads 'approved'.
 */
export default async function ChapterLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  if (hasSupabaseEnv) {
    const chapter = await getMyChapter();
    if (!chapter) redirect("/onboarding?side=chapter");

    if (chapter.status !== "approved") {
      const rejected = chapter.status === "rejected";
      return (
        <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col items-center justify-center gap-6 px-5 text-center">
          <GlassPanel specular className="flex flex-col items-center gap-4 p-10">
            <span className="chip chip-forest">
              {chapter.school ?? "Your chapter"}
            </span>
            <h1 className="text-2xl font-semibold tracking-tight text-ink">
              {rejected ? "Not this round." : "Under review."}
            </h1>
            <p className="max-w-[42ch] text-[0.95rem] leading-relaxed text-muted">
              {rejected
                ? "We are not opening a chapter at your school this round. It is not a verdict on you — reply to the email you got and we will tell you exactly what would change the answer."
                : "Chapters get read one at a time, by a person, because handing a school's chapter to the wrong lead is worse than that school not having one. Usually about a week."}
            </p>
            <p className="max-w-[42ch] text-[0.88rem] leading-relaxed text-muted">
              Nothing here stops you applying for a placement — the two are
              separate.{" "}
              <a
                href="/onboarding?side=intern"
                className="font-medium text-forest hover:text-forest-deep"
              >
                Apply as an intern →
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

  return (
    <div className="min-h-dvh px-5 pt-10 pb-36 sm:px-8">
      {children}
      <ChapterTabBar />
    </div>
  );
}
