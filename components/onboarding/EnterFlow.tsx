"use client";

import { useState } from "react";
import Link from "next/link";
import { InternApplication } from "@/components/apply/InternApplication";
import { StartupApplication } from "@/components/apply/StartupApplication";
import { ChapterApplication } from "@/components/apply/ChapterApplication";
import type { ApplyPrefill } from "@/components/apply/ApplyStepper";
import { getBrowserSupabase } from "@/lib/supabase/client";
import type { Side } from "@/lib/apply-sides";

/**
 * Welcome, then the application.
 *
 * The old screen here was a full page asking you to choose Intern, Startup or
 * Chapter in 7rem type before it asked anything useful. That choice is now a
 * quiet line: almost everyone arriving from Enter is a student, so the page
 * assumes it and offers the other two as a sentence rather than as three equal
 * doors.
 *
 * GitHub comes first because it is the one thing that says what someone has
 * actually built, and it is one click rather than a paragraph. Signing in is
 * optional in both directions — the handle is a normal question in the
 * application either way, so refusing OAuth costs nothing but a keystroke.
 */
export function EnterFlow({
  side,
  prefill,
}: {
  side: Side;
  prefill: ApplyPrefill;
}) {
  const [started, setStarted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [oauthError, setOauthError] = useState<string | null>(null);

  async function signInWithGitHub() {
    setBusy(true);
    setOauthError(null);

    const supabase = getBrowserSupabase();
    if (!supabase) {
      setOauthError("Accounts are not switched on yet — carry on without one.");
      setBusy(false);
      return;
    }

    const origin =
      process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "") ||
      window.location.origin;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(
          `/onboarding?side=${side}`,
        )}`,
      },
    });

    if (error) {
      // GitHub may simply not be enabled on the Supabase project. That is not
      // a dead end — the handle is a question in the application regardless.
      setOauthError("GitHub sign-in is not available right now.");
      setBusy(false);
    }
  }

  if (started) {
    const shared = { prefill, backHref: "/", chrome: "embedded" as const };
    if (side === "startup") return <StartupApplication {...shared} />;
    if (side === "chapter") return <ChapterApplication {...shared} />;
    return <InternApplication {...shared} />;
  }

  return (
    <div>
      <p className="font-mono text-[0.72rem] tracking-[0.12em] text-faint uppercase">
        Let&apos;s get you started
      </p>

      <h1 className="mt-5 font-display text-[clamp(2.1rem,4.4vw,3.1rem)] leading-[1.06] tracking-[-0.02em] text-ink">
        Welcome to Axiom.
      </h1>

      <p className="mt-5 text-[1.05rem] leading-[1.55] text-muted">
        Start with GitHub and we will use your handle to connect your work to
        your application. No repo? Skip it — you can paste any link later.
      </p>

      <button
        type="button"
        onClick={signInWithGitHub}
        disabled={busy}
        className="btn-gloss mt-9 w-full justify-center px-7 py-4 text-[1.02rem] disabled:opacity-70"
      >
        <GitHubMark />
        {busy ? "Opening GitHub…" : "Continue with GitHub"}
        <span aria-hidden="true">↗</span>
      </button>

      {oauthError && (
        <p className="mt-3 text-center font-mono text-[0.68rem] tracking-[0.08em] text-error uppercase">
          {oauthError}
        </p>
      )}

      <button
        type="button"
        onClick={() => setStarted(true)}
        className="mt-5 w-full cursor-pointer text-center text-[0.95rem] text-muted underline underline-offset-4 transition-colors hover:text-ink"
      >
        Continue without an account
      </button>

      <p className="mt-8 text-center text-[0.85rem] leading-relaxed text-faint">
        One account for your application, your matches and the decision.
      </p>

      <div className="mt-10 border-t border-line pt-6 text-center text-[0.9rem] text-muted">
        {side === "intern" ? (
          <>
            Hiring interns instead?{" "}
            <Link
              href="/onboarding?side=startup"
              className="text-ink underline underline-offset-4 hover:text-forest"
            >
              Start here
            </Link>
            , or{" "}
            <Link
              href="/onboarding?side=chapter"
              className="text-ink underline underline-offset-4 hover:text-forest"
            >
              start a chapter
            </Link>
            .
          </>
        ) : (
          <>
            Looking for an internship instead?{" "}
            <Link
              href="/onboarding?side=intern"
              className="text-ink underline underline-offset-4 hover:text-forest"
            >
              This way
            </Link>
            .
          </>
        )}
      </div>

      <p className="mt-6 text-center">
        <Link
          href="/"
          className="text-[0.9rem] text-faint transition-colors hover:text-ink"
        >
          ← Back to the homepage
        </Link>
      </p>
    </div>
  );
}

function GitHubMark() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="h-[1.1em] w-[1.1em]" fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}
