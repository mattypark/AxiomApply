import Link from "next/link";
import { redirect } from "next/navigation";
import { GlassPanel } from "@/components/glass/GlassPanel";
import { Reveal } from "@/components/motion/Reveal";
import { AuthForm } from "@/components/auth/AuthForm";
import { getProfile, getUser } from "@/lib/auth";

export const metadata = { title: "Sign in" };

/**
 * Sign in — for people who already have an account.
 *
 * Distinct from Get started, which sends newcomers to the side picker. This
 * page went to a redirect for a while, which meant the header's Sign in
 * button dropped returning users into "which side are you on?" — a question
 * they had already answered.
 *
 * Anyone already signed in skips straight to where they belong.
 */
export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const target = next && next.startsWith("/") ? next : "";

  const user = await getUser();
  if (user) {
    if (target) redirect(target);
    const profile = await getProfile();
    if (profile?.role === "startup") redirect("/startup/home");
    if (profile?.role === "intern") redirect("/home");
    redirect("/onboarding");
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-6 px-5 py-12">
      <Reveal className="w-full">
        <GlassPanel
          variant="deep"
          specular
          className="flex w-full flex-col items-center gap-6 p-7 sm:p-9"
        >
          <div className="flex flex-col items-center gap-2 text-center">
            <span className="kicker">Axiom Pathways</span>
            <h1 className="text-2xl font-semibold tracking-tight text-ink">
              Welcome back.
            </h1>
            <p className="max-w-[34ch] text-[0.9rem] leading-relaxed text-muted">
              Sign in to pick up your application, save internships, and see
              where you stand.
            </p>
          </div>

          <AuthForm next={target || "/home"} />
        </GlassPanel>
      </Reveal>

      <Reveal delay={0.1} className="flex flex-col items-center gap-2 text-center">
        <p className="text-[0.9rem] text-muted">
          First time here?{" "}
          <Link
            href="/onboarding"
            className="font-medium text-forest transition-colors hover:text-forest-deep"
          >
            Get started →
          </Link>
        </p>
        <Link
          href="/"
          className="text-[0.82rem] text-muted transition-colors hover:text-ink"
        >
          ← Everything works without an account
        </Link>
      </Reveal>
    </main>
  );
}
