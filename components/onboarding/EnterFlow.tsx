"use client";

import { useState } from "react";
import { InternApplication } from "@/components/apply/InternApplication";
import { StartupApplication } from "@/components/apply/StartupApplication";
import { ChapterApplication } from "@/components/apply/ChapterApplication";
import { PathPicker, SIDES } from "@/components/home/PathPicker";
import { EnterShell } from "@/components/onboarding/EnterShell";
import { GoogleButton } from "@/components/onboarding/GoogleButton";
import type { ApplyPrefill } from "@/components/onboarding/flow/useApplication";
import type { Side } from "@/lib/apply-sides";

/**
 * Where Enter goes: the account first, then the application.
 *
 * Signed out, it is one headline, the path picker from the home, and Google
 * as the one button. Signed in — including on the way back from Google — it
 * skips straight into the question flow with the name and email already
 * filled. "Continue without an account" stays as a quiet link: the Sheet is
 * authoritative and nobody is ever blocked from applying by an OAuth screen.
 */

const LINE: Record<Side, string> = {
  intern: "One application. A person reads every one.",
  startup: "Tell us about the team. We read every startup by hand.",
  chapter: "Bring Axiom to your school.",
};

export function EnterFlow({ side, prefill }: { side: Side; prefill: ApplyPrefill }) {
  const [started, setStarted] = useState(Boolean(prefill.isSignedIn));
  const [active, setActive] = useState(() => Math.max(0, SIDES.findIndex((option) => option.side === side)));
  const picked = SIDES[active];

  if (started) {
    const shared = { prefill, backHref: "/", chrome: "full" as const };
    if (picked.side === "startup") return <StartupApplication {...shared} />;
    if (picked.side === "chapter") return <ChapterApplication {...shared} />;
    return <InternApplication {...shared} />;
  }

  const pick = (index: number) => {
    setActive(index);
    // Keep ?side= honest so a refresh, a shared link or the trip through
    // Google comes back to the same path — without a server round trip.
    const url = new URL(window.location.href);
    url.searchParams.set("side", SIDES[index].side);
    window.history.replaceState(null, "", url);
  };

  return (
    <EnterShell paint={picked.paint}>
      <h1 className="ms-display ms-rise text-[clamp(3rem,6vw,5.6rem)] text-ms-ink">
        Welcome
        <br />
        to Axiom
      </h1>
      <p key={picked.side} className="ms-rise mt-5 text-[19px] text-pretty text-ms-body">
        {LINE[picked.side]}
      </p>

      <PathPicker active={active} onChange={pick} className="mt-9" />

      <div className="mt-6">
        <GoogleButton next={`/onboarding?side=${picked.side}`} />
      </div>

      <button
        type="button"
        onClick={() => setStarted(true)}
        className="mt-4 w-full cursor-pointer text-center text-[15px] text-ms-body underline underline-offset-4 transition-opacity hover:opacity-60"
      >
        or continue without an account
      </button>
    </EnterShell>
  );
}
