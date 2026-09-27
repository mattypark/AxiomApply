"use client";

import { useEffect, useState } from "react";
import { authCallbackUrl } from "@/lib/auth-callback";
import { getBrowserSupabase } from "@/lib/supabase/client";

/**
 * The GitHub step: connect it, and the handle fills itself in.
 *
 * Google is the account; GitHub is evidence. So a signed-in applicant *links*
 * GitHub to the account they already have (Supabase manual identity linking —
 * it has to be switched on in the Supabase Auth settings), and anyone who
 * skipped the account signs in with GitHub instead. Either way the redirect
 * comes back to this same screen: the draft lives in localStorage, and the
 * github question is first, so nothing is lost on the round trip.
 *
 * The typed field underneath always works. If linking is off, or GitHub says
 * no, the applicant types the handle and nothing else changes.
 */
export function GitHubConnect({
  signedIn,
  returnTo,
  onHandle,
}: {
  signedIn: boolean;
  /** Where the OAuth round trip should land — this screen. */
  returnTo: string;
  onHandle: (handle: string) => void;
}) {
  const [handle, setHandle] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  // Already linked (or just came back from linking): read the handle off the
  // identity rather than asking for it.
  useEffect(() => {
    if (!signedIn) return;
    const supabase = getBrowserSupabase();
    if (!supabase) return;

    let cancelled = false;
    supabase.auth.getUser().then(({ data }) => {
      const identity = data.user?.identities?.find((entry) => entry.provider === "github");
      const name = identity?.identity_data?.user_name;
      if (cancelled || typeof name !== "string" || !name) return;
      setHandle(name);
      onHandle(`@${name}`);
    });

    return () => {
      cancelled = true;
    };
  }, [signedIn, onHandle]);

  async function connect() {
    const supabase = getBrowserSupabase();
    if (!supabase) {
      setProblem("accounts are not switched on yet — type your handle below.");
      return;
    }

    setBusy(true);
    setProblem(null);
    const options = { redirectTo: authCallbackUrl(returnTo) };
    const { error } = signedIn
      ? await supabase.auth.linkIdentity({ provider: "github", options })
      : await supabase.auth.signInWithOAuth({ provider: "github", options });

    if (error) {
      // Most often: manual linking is off, or the GitHub provider is not
      // enabled on the project. Neither is the applicant's problem.
      setProblem("github is not connecting right now — type your handle below.");
      setBusy(false);
    }
  }

  if (handle) {
    return (
      <p className="ax-toast-in flex items-center gap-2 text-[14px] text-app-text-2">
        <span className="grid h-5 w-5 place-items-center rounded-full bg-app-accent text-[10px] font-bold text-app-canvas">
          ✓
        </span>
        connected as <span className="text-app-text-1">@{handle}</span>
      </p>
    );
  }

  return (
    <div>
      <button type="button" onClick={connect} disabled={busy} className="btn-gloss disabled:opacity-70">
        <GitHubMark />
        {busy ? "opening github…" : "connect github"}
        <span aria-hidden="true">↗</span>
      </button>
      {problem ? <p className="mt-2 text-[13px] text-app-text-3">{problem}</p> : null}
      <p className="mt-6 text-[12px] text-app-text-3">or type it</p>
    </div>
  );
}

export function GitHubMark() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="h-4 w-4" fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}
