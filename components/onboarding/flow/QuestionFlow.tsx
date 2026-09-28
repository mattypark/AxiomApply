"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import type { Question, QuestionSet } from "@/lib/apply-sections";
import { TEXTAREA_HINT } from "@/lib/apply-sections";
import { Done } from "@/components/onboarding/flow/Done";
import { FlowHeader } from "@/components/onboarding/flow/FlowHeader";
import { FullQuestion } from "@/components/onboarding/flow/FullQuestion";
import { GitHubConnect } from "@/components/onboarding/flow/GitHubConnect";
import {
  FlowChoice,
  FlowFile,
  FlowMulti,
  FlowPicks,
  FlowText,
  FlowTextArea,
} from "@/components/onboarding/flow/inputs";
import { Interstitial } from "@/components/onboarding/flow/Interstitial";
import { FlowLookContext } from "@/components/onboarding/flow/look";
import { ProfileCard } from "@/components/onboarding/flow/ProfileCard";
import { reactionFor } from "@/components/onboarding/flow/reactions";
import { Review } from "@/components/onboarding/flow/Review";
import {
  useApplication,
  validate,
  type Answers,
  type ApplyPrefill,
  type Files,
  type FlatQuestion,
  type SubmitResult,
} from "@/components/onboarding/flow/useApplication";

/**
 * The application, built to be finished.
 *
 * klinn asks its questions as one long dark form. This asks the same frozen
 * questions one at a time on the same dark surface, and spends its effort on
 * the things that keep a sixteen-year-old going to the end:
 *
 *   - every question arrives through a mask, forward or back
 *   - every answer visibly lands on the profile card beside it
 *   - the sections are chapters, announced by a short interstitial
 *   - a few answers get a line back that proves someone is listening
 *   - the rail and the time left say how little remains
 *   - it ends on their own finished card and exactly what happens next
 *
 * None of that touches the payload. useApplication owns answers, drafts,
 * validation, the spam trap and the send; this file only decides how it feels.
 *
 * `chrome="full"` wears the welcome page's clothes — the flight path, the
 * word-by-word questions, the soft tracks — through FlowLookContext, so each
 * piece picks its own classes. `chrome="embedded"` keeps the dark workspace
 * look exactly as it was.
 */

/** Seconds a question usually takes. Only used for the "~N min left" line. */
function secondsFor(question: Question) {
  if (question.type === "textarea") return 50;
  if (question.type === "multi_checkbox" || question.type === "file") return 20;
  return 10;
}

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function QuestionFlow({
  set,
  prefill,
  backHref = "/",
  returnTo,
  chrome = "full",
  onSubmit,
}: {
  set: QuestionSet;
  prefill?: ApplyPrefill;
  backHref?: string;
  /** Where an OAuth round trip from inside the flow should land. */
  returnTo: string;
  /** "embedded" sits inside the intern workspace instead of owning the page. */
  chrome?: "full" | "embedded";
  onSubmit: (answers: Answers, files: Files) => Promise<SubmitResult>;
}) {
  const app = useApplication({ set, prefill, onSubmit });
  const { answers, files, questions, setAnswer, setFile, suggest } = app;

  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [error, setError] = useState<string | null>(null);
  const [interstitial, setInterstitial] = useState<number | null>(null);
  const [reaction, setReaction] = useState<string | null>(null);
  const liveRef = useRef<HTMLParagraphElement>(null);

  const total = questions.length;
  const onReview = index >= total;
  const current: FlatQuestion | undefined = questions[index];

  // Sections with at least one visible question, in order — the rail's
  // segments and the interstitial's "02 / 05" both count these.
  const liveSections = useMemo(() => {
    const seen: number[] = [];
    for (const flat of questions) {
      if (!seen.includes(flat.sectionIndex)) seen.push(flat.sectionIndex);
    }
    return seen;
  }, [questions]);

  const answered = questions.filter(({ question }) =>
    question.type === "file" ? Boolean(files[question.id]) : Boolean(answers[question.id]?.trim()),
  ).length;
  const completion = total ? answered / total : 0;

  const secondsLeft = questions
    .slice(Math.min(index, total))
    .reduce((sum, flat) => sum + secondsFor(flat.question), 0);
  const minutesLeft = Math.max(1, Math.round(secondsLeft / 60));

  const move = useCallback(
    (target: number, dir: 1 | -1) => {
      setDirection(dir);
      setError(null);
      setIndex(target);

      // Entering a new part going forward gets the chapter card. Going back
      // never does — backing up should be instant.
      const from = questions[index];
      const to = questions[target];
      if (dir === 1 && from && to && to.sectionIndex !== from.sectionIndex && !prefersReducedMotion()) {
        setInterstitial(to.sectionIndex);
      }
    },
    [questions, index],
  );

  const goNext = useCallback(() => {
    if (onReview || !current) return;
    const problem = validate(current.question, answers, files);
    if (problem) {
      setError(problem);
      return;
    }
    setReaction(reactionFor(current.question.id, answers));
    move(index + 1, 1);
  }, [onReview, current, answers, files, move, index]);

  const goBack = useCallback(() => {
    if (index === 0) return;
    setReaction(null);
    move(index - 1, -1);
  }, [index, move]);

  // Announce each question for screen readers; the visible heading changes
  // but nothing else would say so.
  useEffect(() => {
    if (!liveRef.current) return;
    liveRef.current.textContent = onReview
      ? "Review your answers"
      : current
        ? `Question ${index + 1} of ${total}: ${current.question.label}`
        : "";
  }, [index, total, onReview, current]);

  // Enter moves on from screens with nothing focused to type into — choice
  // cards, the file drop. Inputs handle their own Enter, and a focused button
  // or link already means Enter is a click.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Enter" || interstitial !== null || onReview) return;
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "BUTTON" || tag === "A") return;
      event.preventDefault();
      goNext();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, interstitial, onReview]);

  const handleGitHubHandle = useCallback((handle: string) => suggest("github", handle), [suggest]);

  const firstName = (answers[set.gate.nameId] ?? "").trim().split(/\s+/)[0] ?? "";

  const full = chrome === "full";
  const frame = full
    ? "ms-flow relative flex min-h-dvh flex-col"
    : "relative overflow-hidden rounded-[20px] bg-app-canvas text-app-text-1";

  if (app.submitted) {
    const done = (
      <Done
        set={set}
        answers={answers}
        files={files}
        signedIn={Boolean(prefill?.isSignedIn)}
        firstName={firstName}
      />
    );
    return (
      <FlowLookContext.Provider value={chrome}>
        {full ? (
          <div className={frame}>
            <FlowHeader exitHref={backHref} />
            {done}
          </div>
        ) : (
          <div className={`${frame} flex items-center`}>{done}</div>
        )}
      </FlowLookContext.Provider>
    );
  }

  const currentSegment = onReview ? liveSections.length : liveSections.indexOf(current?.sectionIndex ?? -1);
  const sectionStart = current ? questions.findIndex((flat) => flat.sectionIndex === current.sectionIndex) : 0;
  const sectionLength = current ? questions.filter((flat) => flat.sectionIndex === current.sectionIndex).length : 1;
  const status = onReview ? "Review" : `${index + 1} of ${total} · ~${minutesLeft} min`;

  const answer = current ? (
    <>
      {current.question.id === "github" ? (
        <div className="mb-5">
          <GitHubConnect
            signedIn={Boolean(prefill?.isSignedIn)}
            returnTo={returnTo}
            onHandle={handleGitHubHandle}
          />
        </div>
      ) : null}

      <Answer
        question={current.question}
        answers={answers}
        files={files}
        onAnswer={(value) => {
          setAnswer(current.question.id, value);
          setError(null);
        }}
        onFile={(file) => setFile(current.question.id, file)}
        onEnter={goNext}
      />
    </>
  ) : null;

  return (
    <FlowLookContext.Provider value={chrome}>
      <div className={frame}>
        <p ref={liveRef} aria-live="polite" className="sr-only" />

        {full ? (
          <FlowHeader
            exitHref={backHref}
            flight={{
              sections: liveSections.map((sectionIndex) => set.sections[sectionIndex].nav),
              current: currentSegment,
              within: onReview ? 0 : (index - sectionStart) / Math.max(sectionLength, 1),
              status,
            }}
          />
        ) : (
          /* top bar: way out · the rail · what is left */
          <header className="relative z-30 mx-auto flex h-16 w-full max-w-[68rem] items-center gap-5 px-5 sm:px-6">
            <Link
              href={backHref}
              className="flex shrink-0 items-center gap-1.5 text-[13px] text-app-text-3 transition-colors hover:text-app-text-1"
            >
              <span aria-hidden="true">←</span> {set.heading}
            </Link>

            <div className="flex flex-1 gap-1" aria-hidden="true">
              {liveSections.map((sectionIndex, segment) => {
                const inSection = questions.filter((flat) => flat.sectionIndex === sectionIndex);
                const before = questions.findIndex((flat) => flat.sectionIndex === sectionIndex);
                const fill =
                  segment < currentSegment
                    ? 1
                    : segment > currentSegment
                      ? 0
                      : (index - before) / Math.max(inSection.length, 1);
                return (
                  <span key={sectionIndex} className="h-[3px] flex-1 overflow-hidden rounded-full bg-app-hover">
                    <span
                      className="block h-full rounded-full bg-app-accent transition-[width] duration-500 ease-mask"
                      style={{ width: `${Math.round(Math.min(fill, 1) * 100)}%` }}
                    />
                  </span>
                );
              })}
            </div>

            <span className="shrink-0 text-[12px] text-app-text-3 tabular-nums">{status}</span>
          </header>
        )}

        <div
          className={
            full
              ? "mx-auto grid w-full max-w-[90rem] flex-1 gap-12 px-6 pb-10 sm:px-[6.5%] lg:grid-cols-2 lg:gap-20"
              : "mx-auto grid w-full max-w-[68rem] gap-12 px-5 pb-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-20"
          }
        >
          <main
            // Top-anchored on phones, where the keyboard takes the bottom half
            // and a centred question would sit underneath it. On the full
            // page the column stands where the welcome page's words stood.
            className={`relative flex flex-col justify-start pb-10 lg:justify-center lg:py-10 ${
              full
                ? "min-h-[calc(100dvh-8rem)] w-full max-w-[34rem] pt-10 max-lg:mx-auto xl:ml-32"
                : "min-h-[36rem] pt-12"
            }`}
          >
            {interstitial !== null && set.sections[interstitial] ? (
              <Interstitial
                section={set.sections[interstitial]}
                position={liveSections.indexOf(interstitial) + 1}
                total={liveSections.length}
                onDone={() => setInterstitial(null)}
              />
            ) : null}

            {onReview ? (
              <>
                <Review
                  questions={questions}
                  answers={answers}
                  files={files}
                  onEdit={(target) => move(target, -1)}
                />
                <div className={`mt-10 flex flex-wrap items-center ${full ? "gap-6" : "gap-4"}`}>
                  <button
                    type="button"
                    onClick={app.submit}
                    disabled={app.submitting}
                    className={full ? "ms-pill cursor-pointer disabled:opacity-70" : "btn-gloss disabled:opacity-70"}
                  >
                    {app.submitting ? "Sending…" : "Send it"} <span aria-hidden="true">↗</span>
                  </button>
                  <button
                    type="button"
                    onClick={goBack}
                    className={
                      full
                        ? "cursor-pointer text-[15px] text-ms-body underline underline-offset-4 transition-opacity hover:opacity-60"
                        : "cursor-pointer text-[14px] text-app-text-3 transition-colors hover:text-app-text-1"
                    }
                  >
                    Back
                  </button>
                </div>
                {app.submitError ? (
                  <p role="alert" className="mt-4 text-[13px] text-[#ff8a80] [.ms-flow_&]:text-[#b3261e]">
                    {app.submitError}
                  </p>
                ) : null}
              </>
            ) : current && interstitial === null && full ? (
              // Held back while the chapter card is up, so the question rises
              // in after the card rather than underneath it.
              <FullQuestion
                key={current.question.id}
                question={current.question}
                section={current.section}
                direction={direction}
                reaction={reaction}
                error={error}
                isLast={index === total - 1}
                canGoBack={index > 0}
                onNext={goNext}
                onBack={goBack}
              >
                {answer}
              </FullQuestion>
            ) : current && interstitial === null ? (
              <div
                key={current.question.id}
                className="ax-q-in"
                style={{ "--dir": direction } as CSSProperties}
              >
                {reaction && direction === 1 ? (
                  <p key={reaction} className="ax-toast-in mb-6 text-[14px] text-app-accent">
                    <span aria-hidden="true">↳ </span>
                    {reaction}
                  </p>
                ) : null}

                <p className="flex items-center gap-2 text-[13px] text-app-text-3">
                  <span className="text-app-accent">{String(currentSegment + 1).padStart(2, "0")}</span>
                  <span>/ {current.section.nav}</span>
                  <span className="ml-1 rounded-[5px] bg-app-card px-1.5 py-0.5 text-[11px]">
                    {current.question.required ? "Required" : "Optional"}
                  </span>
                </p>

                <h2
                  id={`q-${current.question.id}`}
                  className="mt-4 font-display text-[34px] leading-[38px] tracking-[-0.34px] text-app-text-1 sm:text-[44px] sm:leading-[48px] sm:tracking-[-0.44px]"
                >
                  <label htmlFor={`f-${current.question.id}`}>{current.question.label}</label>
                </h2>

                {current.question.helpText || current.question.type === "textarea" ? (
                  <p className="mt-3 max-w-[52ch] text-[15px] leading-[22px] text-app-text-3">
                    {current.question.helpText ?? TEXTAREA_HINT}
                  </p>
                ) : null}

                <div className="mt-8">{answer}</div>

                {error ? (
                  <p role="alert" className="ax-toast-in mt-4 text-[13px] text-[#ff8a80]">
                    {error}
                  </p>
                ) : null}

                <div className="mt-9 flex items-center gap-5">
                  <button type="button" onClick={goNext} className="btn-gloss">
                    {index === total - 1 ? "Review" : "OK"}
                    <span aria-hidden="true" className="text-white/70">
                      ↵
                    </span>
                  </button>
                  {index > 0 ? (
                    <button
                      type="button"
                      onClick={goBack}
                      className="cursor-pointer text-[14px] text-app-text-3 transition-colors hover:text-app-text-1"
                    >
                      Back
                    </button>
                  ) : null}
                  <span className="ml-auto hidden text-[12px] text-app-text-3 sm:block">
                    Saved as you go
                  </span>
                </div>
              </div>
            ) : null}
          </main>

          {/* Full page: the card starts level with a centred question and
              sticks there, so a long review scrolls past it. */}
          <aside className={full ? "hidden items-start justify-center lg:flex" : "hidden lg:block"}>
            <div
              className={
                full
                  ? "sticky top-[max(6rem,calc(50dvh-14rem))] mt-[max(1rem,calc(50dvh-19rem))] w-full max-w-[22rem]"
                  : "sticky top-24"
              }
            >
              <ProfileCard setKey={set.key} answers={answers} files={files} completion={completion} />
            </div>
          </aside>
        </div>

        {/* Spam trap. Off-screen rather than display:none — some bots skip
            hidden inputs, fewer skip ones merely positioned away. Never
            focusable, never read aloud, never sent. */}
        <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label htmlFor="company-website-url">Leave this empty</label>
          <input
            id="company-website-url"
            name="company-website-url"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            onChange={(event) => {
              app.trapRef.current = event.target.value;
            }}
          />
        </div>
      </div>
    </FlowLookContext.Provider>
  );
}

function Answer({
  question,
  answers,
  files,
  onAnswer,
  onFile,
  onEnter,
}: {
  question: Question;
  answers: Answers;
  files: Files;
  onAnswer: (value: string) => void;
  onFile: (file: File | null) => void;
  onEnter: () => void;
}) {
  const value = answers[question.id] ?? "";

  switch (question.type) {
    case "textarea":
      return <FlowTextArea question={question} value={value} onChange={onAnswer} onEnter={onEnter} />;
    case "select":
    case "yes_no":
      return <FlowChoice question={question} value={value} onChange={onAnswer} onAdvance={onEnter} />;
    case "multi_checkbox":
      return question.id === "startup_picks" ? (
        <FlowPicks question={question} value={value} onChange={onAnswer} />
      ) : (
        <FlowMulti question={question} value={value} onChange={onAnswer} />
      );
    case "file":
      return <FlowFile question={question} file={files[question.id] ?? null} onFile={onFile} />;
    default:
      return <FlowText question={question} value={value} onChange={onAnswer} onEnter={onEnter} />;
  }
}
