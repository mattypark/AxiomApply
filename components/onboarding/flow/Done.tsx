"use client";

import Link from "next/link";
import type { QuestionSet } from "@/lib/apply-sections";
import { Launch } from "@/components/onboarding/flow/Launch";
import { useFullLook } from "@/components/onboarding/flow/look";
import { ProfileCard } from "@/components/onboarding/flow/ProfileCard";
import { RiseWords, rise, riseEnd } from "@/components/onboarding/flow/RiseWords";
import type { Answers, Files } from "@/components/onboarding/flow/useApplication";

/**
 * The result screen: the finished card, and exactly what happens next.
 *
 * It is personal on purpose — their name, their card, their picks — because
 * the last thing a form usually says is "thanks", which is the moment people
 * decide it went into a void. The timeline restates each set's real promise
 * (see `dates` / `note` in lib/apply-sections.ts); none of it is new.
 *
 * On the full-page flow the send is a launch (Launch.tsx) and the screen
 * assembles under it like the welcome page: the headline rises word by word
 * with their name in the path colour, then the steps and the finished card.
 */

const HOME_BY_SET: Record<QuestionSet["key"], string> = {
  intern: "/home",
  startup: "/startup/home",
  chapter: "/chapter/home",
};

const NEXT_STEPS: Record<QuestionSet["key"], { when: string; what: string }[]> = {
  intern: [
    { when: "Today", what: "It is in, and a person has it." },
    { when: "Within 14 days", what: "You hear back, either way." },
    { when: "If it fits", what: "The email names the startup and the role." },
  ],
  startup: [
    { when: "Today", what: "It is in." },
    { when: "Within a few days", what: "Matthew reads it by hand before it goes live." },
    { when: "Once approved", what: "You browse intern profiles and request people." },
  ],
  chapter: [
    { when: "Today", what: "It is in." },
    { when: "Within a week", what: "A person reviews it — chapters are approved one at a time." },
    { when: "If approved", what: "We plan your first thirty days together." },
  ],
};

export function Done({
  set,
  answers,
  files,
  signedIn,
  firstName,
}: {
  set: QuestionSet;
  answers: Answers;
  files: Files;
  signedIn: boolean;
  firstName: string;
}) {
  const full = useFullLook();
  if (full) {
    return <FullDone set={set} answers={answers} files={files} signedIn={signedIn} firstName={firstName} />;
  }

  return (
    <div className="mx-auto grid w-full max-w-[60rem] items-center gap-14 px-6 py-20 lg:grid-cols-[1fr_20rem]">
      <div className="ax-q-in">
        <p className="flex items-center gap-2 text-[13px] text-app-accent">
          <span className="ax-pulse h-1.5 w-1.5 rounded-full bg-signal" />
          Sent
        </p>
        <h1 className="mt-4 font-display text-[44px] leading-[48px] tracking-[-0.46px] text-app-text-1 sm:text-[56px] sm:leading-[58px]">
          A person reads this one
          {firstName ? (
            <>
              , <em className="italic">{firstName}.</em>
            </>
          ) : (
            "."
          )}
        </h1>

        <ol className="mt-10 flex flex-col">
          {NEXT_STEPS[set.key].map((step, index) => (
            <li
              key={step.when}
              className="ax-q-in grid grid-cols-[1.25rem_7.5rem_1fr] items-baseline gap-3 border-t border-app-line py-4 last:border-b"
              style={{ animationDelay: `${300 + index * 140}ms` }}
            >
              <span
                className={`h-2 w-2 rounded-full ${index === 0 ? "bg-app-accent" : "bg-app-hover"}`}
              />
              <span className="text-[13px] text-app-text-3">{step.when}</span>
              <span className="text-[15px] text-app-text-1">{step.what}</span>
            </li>
          ))}
        </ol>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          {/* A signed-out applicant is offered the account here, where it buys
              something real — a place to see the decision. */}
          {!signedIn ? (
            <Link href="/auth" className="btn-gloss">
              Save it to an account <span aria-hidden="true">↗</span>
            </Link>
          ) : null}
          <Link
            href={HOME_BY_SET[set.key]}
            className={signedIn ? "btn-gloss" : "text-[14px] text-app-text-3 underline underline-offset-4 transition-colors hover:text-app-text-1"}
          >
            {signedIn ? "Go to your home" : "Look around first"}
          </Link>
        </div>
      </div>

      <div className="ax-q-in" style={{ animationDelay: "200ms" }}>
        <ProfileCard setKey={set.key} answers={answers} files={files} completion={1} />
      </div>
    </div>
  );
}

function FullDone({
  set,
  answers,
  files,
  signedIn,
  firstName,
}: {
  set: QuestionSet;
  answers: Answers;
  files: Files;
  signedIn: boolean;
  firstName: string;
}) {
  const lead = firstName ? "A person reads this one," : "A person reads this one.";
  const leadStart = 700;
  const after = riseEnd(lead, leadStart) + (firstName ? 120 : 60);

  return (
    <>
      <Launch />
      <div className="mx-auto grid w-full max-w-[90rem] flex-1 items-center gap-12 px-6 pt-8 pb-16 sm:px-[6.5%] lg:grid-cols-2 lg:gap-20">
        <div className="w-full max-w-[34rem] max-lg:mx-auto xl:ml-32">
          <p
            className="flow-rise inline-flex items-center gap-2.5 rounded-full bg-white/70 py-1.5 pr-4 pl-3 text-[14px] font-medium text-ms-ink"
            style={rise(leadStart - 150)}
          >
            <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-[var(--path-em)]" />
            Sent
          </p>
          <h1 className="ms-display mt-5 text-[clamp(2.9rem,5.4vw,5.2rem)] text-ms-ink">
            <RiseWords text={lead} start={leadStart} />
            {firstName ? (
              <>
                {" "}
                <span className="text-ms-green">
                  <RiseWords text={`${firstName}.`} start={after - 60} />
                </span>
              </>
            ) : null}
          </h1>

          <ol className="mt-10 rounded-[28px] bg-white p-2 shadow-[0_24px_50px_-36px_rgb(23_25_28_/_0.45)]">
            {NEXT_STEPS[set.key].map((step, index) => (
              <li
                key={step.when}
                className="flow-rise grid grid-cols-[1.25rem_7.5rem_1fr] items-baseline gap-3 border-t border-ms-ink/[0.06] px-4 py-3.5 first:border-t-0 max-sm:grid-cols-[1.25rem_1fr]"
                style={rise(after + 200 + index * 120)}
              >
                <span
                  aria-hidden="true"
                  className={`h-2.5 w-2.5 self-center rounded-full ${
                    index === 0 ? "bg-[var(--path-em)]" : "bg-[var(--path-ground-2)]"
                  }`}
                />
                <span className="text-[13px] text-ms-muted">{step.when}</span>
                <span className="text-[15px] text-ms-ink max-sm:col-start-2">{step.what}</span>
              </li>
            ))}
          </ol>

          <div className="flow-rise mt-9 flex flex-wrap items-center gap-6" style={rise(after + 620)}>
            {/* A signed-out applicant is offered the account here, where it buys
                something real — a place to see the decision. */}
            {!signedIn ? (
              <Link href="/auth" className="ms-pill">
                Save it to an account <span aria-hidden="true">↗</span>
              </Link>
            ) : null}
            <Link
              href={HOME_BY_SET[set.key]}
              className={
                signedIn
                  ? "ms-pill"
                  : "text-[15px] text-ms-body underline underline-offset-4 transition-opacity hover:opacity-60"
              }
            >
              {signedIn ? "Go to your home" : "Look around first"}
            </Link>
          </div>
        </div>

        <div className="flow-rise mx-auto w-full max-w-[22rem]" style={rise(after + 350)}>
          <ProfileCard setKey={set.key} answers={answers} files={files} completion={1} />
        </div>
      </div>
    </>
  );
}
