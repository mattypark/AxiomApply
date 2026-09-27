"use client";

import Link from "next/link";
import type { QuestionSet } from "@/lib/apply-sections";
import { ProfileCard } from "@/components/onboarding/flow/ProfileCard";
import type { Answers, Files } from "@/components/onboarding/flow/useApplication";

/**
 * The result screen: the finished card, and exactly what happens next.
 *
 * It is personal on purpose — their name, their card, their picks — because
 * the last thing a form usually says is "thanks", which is the moment people
 * decide it went into a void. The timeline restates each set's real promise
 * (see `dates` / `note` in lib/apply-sections.ts); none of it is new.
 */

const HOME_BY_SET: Record<QuestionSet["key"], string> = {
  intern: "/home",
  startup: "/startup/home",
  chapter: "/chapter/home",
};

const NEXT_STEPS: Record<QuestionSet["key"], { when: string; what: string }[]> = {
  intern: [
    { when: "today", what: "it is in, and a person has it." },
    { when: "within 14 days", what: "you hear back, either way." },
    { when: "if it fits", what: "the email names the startup and the role." },
  ],
  startup: [
    { when: "today", what: "it is in." },
    { when: "within a few days", what: "matthew reads it by hand before it goes live." },
    { when: "once approved", what: "you browse intern profiles and request people." },
  ],
  chapter: [
    { when: "today", what: "it is in." },
    { when: "within a week", what: "a person reviews it — chapters are approved one at a time." },
    { when: "if approved", what: "we plan your first thirty days together." },
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
  return (
    <div className="mx-auto grid w-full max-w-[60rem] items-center gap-14 px-6 py-20 lg:grid-cols-[1fr_20rem]">
      <div className="ax-q-in">
        <p className="flex items-center gap-2 text-[13px] text-app-accent">
          <span className="ax-pulse h-1.5 w-1.5 rounded-full bg-signal" />
          sent
        </p>
        <h1 className="mt-4 font-display text-[44px] leading-[48px] tracking-[-0.46px] text-app-text-1 sm:text-[56px] sm:leading-[58px]">
          a person reads this one
          {firstName ? (
            <>
              , <em className="italic">{firstName.toLowerCase()}.</em>
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
              save it to an account <span aria-hidden="true">↗</span>
            </Link>
          ) : null}
          <Link
            href={HOME_BY_SET[set.key]}
            className={signedIn ? "btn-gloss" : "text-[14px] text-app-text-3 underline underline-offset-4 transition-colors hover:text-app-text-1"}
          >
            {signedIn ? "go to your home" : "look around first"}
          </Link>
        </div>
      </div>

      <div className="ax-q-in" style={{ animationDelay: "200ms" }}>
        <ProfileCard setKey={set.key} answers={answers} files={files} completion={1} />
      </div>
    </div>
  );
}
