import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/AuthForm";
import { EnterShell } from "@/components/onboarding/EnterShell";
import { GoogleButton } from "@/components/onboarding/GoogleButton";
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
    <EnterShell>
      <h1 className="ms-display ms-rise text-[clamp(3rem,6vw,5.6rem)] text-ms-ink">
        Welcome
        <br />
        back
      </h1>
      <p className="ms-rise mt-5 text-[19px] text-ms-body">Pick up where you left off.</p>

      <div className="mt-9">
        <GoogleButton next={target || "/home"} />
      </div>

      {/* Older accounts were made with an email and password. They still work;
          they just are not the front door any more. The glass form sits in
          the picker's soft track so its white fields still read on the green. */}
      <details className="group mt-5">
        <summary className="cursor-pointer list-none text-center text-[15px] text-ms-body underline underline-offset-4 transition-opacity hover:opacity-60">
          Use email and password instead
        </summary>
        <div className="mt-5 rounded-[28px] bg-white/55 p-5">
          <AuthForm next={target || "/home"} withGoogle={false} />
        </div>
      </details>

      <p className="mt-10 border-t border-ms-ink/10 pt-6 text-center text-[15px] text-ms-body">
        First time here?{" "}
        <Link href="/onboarding" className="font-medium text-ms-ink underline underline-offset-4">
          Get started
        </Link>
      </p>
    </EnterShell>
  );
}
