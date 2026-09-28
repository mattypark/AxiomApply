"use client";

import { useState } from "react";
import { authCallbackUrl } from "@/lib/auth-callback";
import { getBrowserSupabase } from "@/lib/supabase/client";

/**
 * Continue with Google, or with GitHub — the account buttons, as the home's
 * pills: `primary` is the black one, `secondary` the white one beside it.
 *
 * Google is the account for everyone: applicants are mostly in high school,
 * where a Google account is universal and a GitHub one is not. Interns who do
 * have GitHub get it as a second door, since their work lives there; everyone
 * else can still connect it later, inside the application.
 */

export type OAuthProvider = "google" | "github";

const NAME: Record<OAuthProvider, string> = { google: "Google", github: "GitHub" };

export function OAuthButton({
  provider,
  next,
  tone = "primary",
}: {
  provider: OAuthProvider;
  next: string;
  tone?: "primary" | "secondary";
}) {
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const name = NAME[provider];

  async function go() {
    const supabase = getBrowserSupabase();
    if (!supabase) {
      setProblem("Accounts aren’t switched on yet — carry on without one.");
      return;
    }

    setBusy(true);
    setProblem(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: authCallbackUrl(next) },
    });

    if (error) {
      setProblem(`${name} sign-in isn’t available right now — carry on without an account.`);
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={go}
        disabled={busy}
        className={`ms-pill h-16 w-full text-[18px] disabled:opacity-70 ${
          tone === "secondary"
            ? "bg-white! text-ms-ink! shadow-[inset_0_0_0_1px_rgb(23_25_28_/_0.12)] hover:bg-ms-mist!"
            : ""
        }`}
      >
        {provider === "google" ? <GoogleMark /> : <GitHubMark />}
        {busy ? `Opening ${name}…` : `Continue with ${name}`}
      </button>
      {problem ? (
        <p role="alert" className="mt-3 text-center text-[14px] text-ms-body">
          {problem}
        </p>
      ) : null}
    </div>
  );
}

function GoogleMark() {
  return (
    <svg width="19" height="19" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="currentColor"
        d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"
      />
    </svg>
  );
}

function GitHubMark() {
  return (
    <svg width="19" height="19" viewBox="0 0 16 16" aria-hidden="true" fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}
