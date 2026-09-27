"use client";

import { useState } from "react";
import { authCallbackUrl } from "@/lib/auth-callback";
import { getBrowserSupabase } from "@/lib/supabase/client";

/**
 * Continue with Google — the one account button.
 *
 * klinn signs in with GitHub. Axiom's applicants are mostly in high school,
 * where a Google account is universal and a GitHub one is not, so Google is
 * the account and GitHub is connected later, inside the application, as
 * evidence of work.
 */
export function GoogleButton({ next }: { next: string }) {
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  async function go() {
    const supabase = getBrowserSupabase();
    if (!supabase) {
      setProblem("accounts are not switched on yet — carry on without one.");
      return;
    }

    setBusy(true);
    setProblem(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: authCallbackUrl(next) },
    });

    if (error) {
      setProblem("google sign-in is not available right now — carry on without an account.");
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={go}
        disabled={busy}
        className="btn-gloss h-[52px] w-full justify-between rounded-[16px] px-5 text-[15px] disabled:opacity-70"
      >
        <span className="flex items-center gap-3">
          <GoogleMark />
          {busy ? "opening google…" : "continue with google"}
        </span>
        <span aria-hidden="true">↗</span>
      </button>
      {problem ? (
        <p role="alert" className="mt-3 text-center text-[13px] text-app-text-3">
          {problem}
        </p>
      ) : null}
    </div>
  );
}

function GoogleMark() {
  return (
    <svg width="17" height="17" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="currentColor"
        d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"
      />
    </svg>
  );
}
