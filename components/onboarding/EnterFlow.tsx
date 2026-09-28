"use client";

import { useEffect, useState } from "react";
import { InternApplication } from "@/components/apply/InternApplication";
import { StartupApplication } from "@/components/apply/StartupApplication";
import { ChapterApplication } from "@/components/apply/ChapterApplication";
import { PathPicker, SIDES } from "@/components/home/PathPicker";
import { EnterShell } from "@/components/onboarding/EnterShell";
import { OAuthButton } from "@/components/onboarding/OAuthButton";
import { RecommendNote } from "@/components/onboarding/RecommendNote";
import { RocketLoop } from "@/components/onboarding/RocketLoop";
import type { ApplyPrefill } from "@/components/onboarding/flow/useApplication";
import type { Side } from "@/lib/apply-sides";
import { getPath, setPath } from "@/lib/path-theme";

/**
 * Where Enter goes: the account first, then the application.
 *
 * Signed out, it is one headline, the path picker from the home, and the
 * account buttons — Google for everyone, and GitHub too for interns. Signed
 * in — including on the way back from Google — it skips straight into the
 * question flow with the name and email already filled. "Continue without an
 * account" stays as a quiet link: the Sheet is authoritative and nobody is
 * ever blocked from applying by an OAuth screen. `start` (?start=1, from the
 * home's apply block) means that choice was already made: straight in.
 */

const LINE: Record<Side, string> = {
  intern: "One application. A person reads every one.",
  startup: "Tell us about the team. We read every startup by hand.",
  chapter: "Bring Axiom to your school.",
};

export function EnterFlow({
  side,
  prefill,
  start = false,
}: {
  side?: Side;
  prefill: ApplyPrefill;
  start?: boolean;
}) {
  const [started, setStarted] = useState(Boolean(prefill.isSignedIn) || start);
  const [active, setActive] = useState(() => Math.max(0, SIDES.findIndex((option) => option.side === side)));

  // A ?side= in the link wins and becomes the site colour; without one, the
  // path the visitor picked last time is already the colour, so follow it.
  useEffect(() => {
    if (side) setPath(side);
    else setActive(Math.max(0, SIDES.findIndex((option) => option.side === getPath())));
  }, [side]);

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
    <EnterShell art={<RocketLoop side={picked.side} className="absolute inset-0" />}>
      <h1 className="ms-display ms-rise text-[clamp(3rem,6vw,5.6rem)] text-ms-ink">
        Welcome
        <br />
        to Axiom
      </h1>
      <p key={picked.side} className="ms-rise mt-5 text-[19px] text-pretty text-ms-body">
        {LINE[picked.side]}
      </p>

      <PathPicker active={active} onChange={pick} className="mt-9" />

      {/* Interns can bring GitHub, where their work lives; startups and
          chapters sign in with Google. */}
      <div className="mt-6 flex flex-col gap-3">
        <OAuthButton provider="google" next={`/onboarding?side=${picked.side}`} />
        {picked.side === "intern" ? (
          // Room above on phones, where the note sits over the button.
          <div className="relative mt-6 xl:mt-0">
            <OAuthButton provider="github" tone="secondary" next="/onboarding?side=intern" />
            <RecommendNote />
          </div>
        ) : null}
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
