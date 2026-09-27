"use client";

import { useState } from "react";
import Link from "next/link";
import { InternApplication } from "@/components/apply/InternApplication";
import { StartupApplication } from "@/components/apply/StartupApplication";
import { ChapterApplication } from "@/components/apply/ChapterApplication";
import { EnterShell } from "@/components/onboarding/EnterShell";
import { GoogleButton } from "@/components/onboarding/GoogleButton";
import type { ApplyPrefill } from "@/components/onboarding/flow/useApplication";
import type { Side } from "@/lib/apply-sides";

/**
 * Where Enter goes: the account first, then the application.
 *
 * Signed out, it is klinn's sign-in screen with Google as the one button.
 * Signed in — including on the way back from Google — it skips straight into
 * the question flow with the name and email already filled. "Continue without
 * an account" stays as a quiet link: the Sheet is authoritative and nobody is
 * ever blocked from applying by an OAuth screen.
 *
 * The side is a line of text rather than three equal doors: almost everyone
 * arriving from Enter is a student, so the page assumes it and offers the
 * other two as a sentence.
 */
export function EnterFlow({ side, prefill }: { side: Side; prefill: ApplyPrefill }) {
  const [started, setStarted] = useState(Boolean(prefill.isSignedIn));

  if (started) {
    const shared = { prefill, backHref: "/", chrome: "full" as const };
    if (side === "startup") return <StartupApplication {...shared} />;
    if (side === "chapter") return <ChapterApplication {...shared} />;
    return <InternApplication {...shared} />;
  }

  return (
    <EnterShell>
      <p className="text-[15px] text-app-text-3">let&apos;s get you started</p>

      <h1 className="mt-4 font-display text-[40px] leading-[44px] tracking-[-0.4px] text-app-text-1 sm:text-[52px] sm:leading-[54px] sm:tracking-[-0.6px]">
        welcome to axiom.
      </h1>

      <p className="mt-5 text-[18px] leading-[27px] text-app-text-3">
        {side === "startup"
          ? "sign in with google and tell us about the team. we read every startup by hand before it goes live."
          : side === "chapter"
            ? "sign in with google and tell us about your school. chapters are approved one at a time, by a person."
            : "sign in with google, then answer once. connect your github inside if you have one — no repo is fine too."}
      </p>

      <div className="mt-10">
        <GoogleButton next={`/onboarding?side=${side}`} />
      </div>

      <p className="mt-6 text-center text-[13px] leading-[20px] text-app-text-3">
        one account for your application, your matches and the decision.
      </p>

      <button
        type="button"
        onClick={() => setStarted(true)}
        className="mt-3 w-full cursor-pointer text-center text-[13px] text-app-text-3/80 underline underline-offset-4 transition-colors hover:text-app-text-1"
      >
        or continue without an account
      </button>

      <div className="mt-12 border-t border-app-line pt-6 text-center text-[13px] text-app-text-3">
        {side === "intern" ? (
          <>
            hiring interns instead?{" "}
            <Link href="/onboarding?side=startup" className="text-app-text-1 underline underline-offset-4">
              start here
            </Link>
            , or{" "}
            <Link href="/onboarding?side=chapter" className="text-app-text-1 underline underline-offset-4">
              start a chapter
            </Link>
            .
          </>
        ) : (
          <>
            looking for an internship instead?{" "}
            <Link href="/onboarding?side=intern" className="text-app-text-1 underline underline-offset-4">
              this way
            </Link>
            .
          </>
        )}
      </div>

      <p className="mt-8 text-center">
        <Link href="/" className="text-[15px] text-app-text-2 transition-colors hover:text-app-text-1">
          ← back to home
        </Link>
      </p>
    </EnterShell>
  );
}
