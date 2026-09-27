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
      <p className="text-[15px] text-app-text-3">good to see you</p>
      <h1 className="mt-4 font-display text-[40px] leading-[44px] tracking-[-0.4px] text-app-text-1 sm:text-[52px] sm:leading-[54px]">
        welcome back.
      </h1>
      <p className="mt-5 text-[18px] leading-[27px] text-app-text-3">
        sign in to pick up your application, save internships, and see where
        you stand.
      </p>

      <div className="mt-10">
        <GoogleButton next={target || "/home"} />
      </div>

      {/* Older accounts were made with an email and password. They still work;
          they just are not the front door any more. The form keeps its light
          card rather than being restyled for a path most people never open. */}
      <details className="group mt-6">
        <summary className="cursor-pointer list-none text-center text-[13px] text-app-text-3 underline underline-offset-4 transition-colors hover:text-app-text-1">
          use email and password instead
        </summary>
        <div className="mt-5 rounded-[16px] bg-paper p-5">
          <AuthForm next={target || "/home"} withGoogle={false} />
        </div>
      </details>

      <div className="mt-12 border-t border-app-line pt-6 text-center text-[13px] text-app-text-3">
        first time here?{" "}
        <Link href="/onboarding" className="text-app-text-1 underline underline-offset-4">
          get started
        </Link>
      </div>

      <p className="mt-8 text-center">
        <Link href="/" className="text-[15px] text-app-text-2 transition-colors hover:text-app-text-1">
          ← back to home
        </Link>
      </p>
    </EnterShell>
  );
}
