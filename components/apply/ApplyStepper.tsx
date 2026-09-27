"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Question, QuestionSet } from "@/lib/apply-sections";
import { TEXTAREA_HINT } from "@/lib/apply-sections";
import {
  Button,
  FileField,
  MultiCheckboxField,
  SelectField,
  TextArea,
  TextField,
  YesNoField,
} from "@/components/apply/fields";
import {
  splitValues,
  useApplication,
  validate,
  type Answers,
  type ApplyPrefill,
  type Files,
  type SubmitResult,
} from "@/components/onboarding/flow/useApplication";

export {
  submittedKey,
  type ApplyPrefill,
  type SubmitResult,
} from "@/components/onboarding/flow/useApplication";

/**
 * One question, one screen.
 *
 * The previous engine put every question on a single scrolling page with the
 * sections below the gate blurred until you filled it in. It collected the
 * right things and looked like work. A sixteen-year-old deciding whether to
 * apply should never see sixteen questions at once — so they see one, with a
 * rail showing how little is left.
 *
 * Nothing about the payload changes. The ids come from lib/apply-sections.ts,
 * which derives the intern set from the frozen contract in apply-contract.ts
 * and throws at module load if a name drifts. This file restructures
 * presentation only.
 *
 * The account gate is gone from the front. Auth gates nothing else on the
 * site, and asking for a password before the first question cost applications
 * to buy a convenience — creating an account is now offered after the thing
 * is already submitted.
 */

const HOME_BY_SET: Record<QuestionSet["key"], string> = {
  intern: "/home",
  startup: "/startup/home",
  chapter: "/chapter/home",
};

export function ApplyStepper({
  set,
  prefill,
  backHref,
  variant = "light",
  chrome = "full",
  onSubmit,
}: {
  set: QuestionSet;
  prefill?: ApplyPrefill;
  backHref?: string;
  /**
   * The surface this runs on: "light" intern paper, "dark" startup night,
   * "grey" chapter charcoal. Each maps to a scope class in globals.css that
   * recolours the fields — the startup side is a dark page and its inputs
   * have to follow it.
   */
  variant?: "light" | "dark" | "grey";
  chrome?: "full" | "embedded";
  onSubmit: (answers: Answers, files: Files) => Promise<SubmitResult>;
}) {
  const app = useApplication({ set, prefill, onSubmit });
  const { answers, files, questions, submitting, submitted, trapRef } = app;
  const storeAnswer = app.setAnswer;
  const [index, setIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const headingRef = useRef<HTMLDivElement>(null);

  const total = questions.length;
  const onReview = index >= total;
  const current = questions[index];

  const setAnswer = useCallback(
    (id: string, value: string) => {
      storeAnswer(id, value);
      setError(null);
    },
    [storeAnswer],
  );

  const goNext = useCallback(() => {
    if (onReview) return;
    const problem = validate(current.question, answers, files);
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setIndex((i) => i + 1);
  }, [onReview, current, answers, files]);

  const goBack = useCallback(() => {
    setError(null);
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  // Moving between questions moves focus with it. Without this the whole
  // journey is invisible to a screen reader — the heading changes and nothing
  // announces it.
  useEffect(() => {
    headingRef.current?.focus();
  }, [index]);

  async function handleSubmit() {
    setError(null);
    await app.submit();
  }

  // The hook owns the send; its failure message shows where the stepper
  // always showed errors on the review screen.
  const shownError = error ?? app.submitError;

  if (submitted) {
    return (
      <div className={`apply-${variant}`}>
        <Done setKey={set.key} signedIn={Boolean(prefill?.isSignedIn)} />
      </div>
    );
  }

  const progress = total ? Math.min(index / total, 1) : 0;
  const shell =
    chrome === "embedded"
      ? "w-full"
      : "mx-auto flex min-h-dvh w-full max-w-[42rem] flex-col px-6 py-16 sm:py-24";

  return (
    <div className={`apply-${variant} relative ${shell}`}>
      <div className="flex items-center justify-between gap-4">
        {backHref ? (
          <Link
            href={backHref}
            className="font-mono text-[0.68rem] tracking-[0.14em] text-faint uppercase transition-colors hover:text-ink"
          >
            ← {set.heading}
          </Link>
        ) : (
          <span className="font-mono text-[0.68rem] tracking-[0.14em] text-faint uppercase">
            {set.heading}
          </span>
        )}
        <span className="font-mono text-[0.68rem] tracking-[0.14em] text-faint uppercase">
          {onReview ? "Review" : `${index + 1} / ${total}`}
        </span>
      </div>

      {/* The rail is the whole argument for this layout: it says how little is
          left, which a long scrolling form can never say. */}
      <div className="mt-4 h-[2px] w-full bg-ink/[0.08]">
        <div
          className="h-full bg-forest transition-[width] duration-500 ease-story"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>

      <div className="flex flex-1 flex-col justify-center py-14">
        {onReview ? (
          <Review
            questions={questions}
            answers={answers}
            files={files}
            onEdit={(target) => {
              setIndex(target);
              setError(null);
            }}
          />
        ) : (
          <>
            <div
              ref={headingRef}
              tabIndex={-1}
              className="mb-8 outline-none"
              aria-live="polite"
            >
              <p className="font-mono text-[0.68rem] tracking-[0.14em] text-forest uppercase">
                {current.section.nav}
              </p>
            </div>

            <QuestionField
              question={current.question}
              answers={answers}
              files={files}
              error={error ?? undefined}
              onAnswer={setAnswer}
              onFile={app.setFile}
              onEnter={goNext}
            />
          </>
        )}
      </div>

      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={goBack}
          disabled={index === 0}
          className="cursor-pointer font-mono text-[0.68rem] tracking-[0.14em] text-faint uppercase transition-colors hover:text-ink disabled:cursor-default disabled:opacity-0"
        >
          ← Back
        </button>

        {onReview ? (
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Sending…" : "Send it"}
          </Button>
        ) : (
          <Button onClick={goNext}>
            {index === total - 1 ? "Review" : "Next"}
          </Button>
        )}
      </div>

      {shownError && onReview && (
        <p className="mt-4 text-right font-mono text-[0.68rem] tracking-[0.08em] text-error uppercase">
          {shownError}
        </p>
      )}

      {!onReview && (
        <p className="mt-6 text-center font-mono text-[0.62rem] tracking-[0.12em] text-faint uppercase">
          Saved as you go · press Enter to continue
        </p>
      )}

      {/* Off-screen rather than display:none — some bots skip hidden inputs,
          fewer skip ones that are merely positioned away. Never focusable, and
          never read aloud. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="company-website-url">Leave this empty</label>
        <input
          id="company-website-url"
          name="company-website-url"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          onChange={(event) => {
            trapRef.current = event.target.value;
          }}
        />
      </div>
    </div>
  );
}

function QuestionField({
  question,
  answers,
  files,
  error,
  onAnswer,
  onFile,
  onEnter,
}: {
  question: Question;
  answers: Answers;
  files: Files;
  error?: string;
  onAnswer: (id: string, value: string) => void;
  onFile: (id: string, file: File | null) => void;
  onEnter: () => void;
}) {
  const value = answers[question.id] ?? "";

  // Enter advances everywhere it is not the answer itself. In a textarea it
  // has to keep making paragraphs, so that case is excluded.
  const keyHandler = (event: React.KeyboardEvent) => {
    if (event.key !== "Enter") return;
    const target = event.target as HTMLElement;
    if (target.tagName === "TEXTAREA") return;
    event.preventDefault();
    onEnter();
  };

  return (
    <div onKeyDown={keyHandler}>
      {question.type === "textarea" ? (
        <TextArea
          id={question.id}
          label={question.label}
          value={value}
          onChange={(next) => onAnswer(question.id, next)}
          placeholder={question.placeholder}
          required={question.required}
          helpText={question.helpText ?? TEXTAREA_HINT}
          error={error}
          maxLength={question.maxLength}
        />
      ) : question.type === "select" ? (
        <SelectField
          id={question.id}
          label={question.label}
          options={question.options ?? []}
          value={value}
          onChange={(next) => onAnswer(question.id, next)}
          required={question.required}
          helpText={question.helpText}
          error={error}
        />
      ) : question.type === "yes_no" ? (
        <YesNoField
          id={question.id}
          label={question.label}
          value={value}
          onChange={(next) => onAnswer(question.id, next)}
          required={question.required}
          helpText={question.helpText}
          error={error}
        />
      ) : question.type === "multi_checkbox" ? (
        <MultiCheckboxField
          id={question.id}
          label={question.label}
          options={question.options ?? []}
          values={splitValues(value)}
          onChange={(next) => onAnswer(question.id, next.join(", "))}
          required={question.required}
          helpText={question.helpText}
          error={error}
        />
      ) : question.type === "file" ? (
        <FileField
          id={question.id}
          label={question.label}
          file={files[question.id] ?? null}
          onFile={(file) => onFile(question.id, file)}
          accept={question.accept}
          helpText={
            question.helpText ??
            "Optional. Files are not kept if you close the tab before sending."
          }
        />
      ) : (
        <TextField
          id={question.id}
          label={question.label}
          value={value}
          onChange={(next) => onAnswer(question.id, next)}
          type={question.type === "url" ? "url" : (question.inputType ?? "text")}
          placeholder={question.placeholder}
          required={question.required}
          helpText={question.helpText}
          error={error}
          maxLength={question.maxLength}
          autoComplete={question.autocomplete}
        />
      )}
    </div>
  );
}

/**
 * Everything answered, on one page, before it is sent.
 *
 * This is the one screen that shows the whole application at once, and it is
 * the right place for it: the cost of seeing sixteen questions is paid after
 * they are all answered rather than before any of them are.
 */
function Review({
  questions,
  answers,
  files,
  onEdit,
}: {
  questions: { question: Question }[];
  answers: Answers;
  files: Files;
  onEdit: (index: number) => void;
}) {
  return (
    <div>
      <h2 className="font-display text-[clamp(1.9rem,4vw,2.6rem)] leading-[1.1] text-ink">
        Read it back.
      </h2>
      <p className="mt-3 text-[1rem] leading-[1.55] text-muted">
        Click anything to change it. Nothing is sent until you send it.
      </p>

      <dl className="mt-10">
        {questions.map(({ question }, position) => {
          const raw =
            question.type === "file"
              ? (files[question.id]?.name ?? "")
              : (answers[question.id] ?? "");

          return (
            <div
              key={question.id}
              className="border-t border-ink/[0.08] py-4 last:border-b"
            >
              <button
                type="button"
                onClick={() => onEdit(position)}
                className="flex w-full cursor-pointer items-baseline justify-between gap-6 text-left"
              >
                <dt className="shrink-0 text-[0.82rem] text-faint">
                  {question.label}
                </dt>
                <dd
                  className={`text-right text-[0.95rem] ${
                    raw ? "text-ink" : "text-faint italic"
                  }`}
                >
                  {raw || "—"}
                </dd>
              </button>
            </div>
          );
        })}
      </dl>
    </div>
  );
}

function Done({ setKey, signedIn }: { setKey: QuestionSet["key"]; signedIn: boolean }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[42rem] flex-col items-center justify-center px-6 text-center">
      <p className="font-mono text-[0.68rem] tracking-[0.14em] text-forest uppercase">
        Sent
      </p>
      <h2 className="mt-6 font-display text-[clamp(2.2rem,5.5vw,3.4rem)] leading-[1.06] text-ink">
        A person reads this one.
      </h2>
      <p className="mt-5 max-w-[46ch] text-[1.0625rem] leading-[1.55] text-muted">
        Fourteen days, either way. If we match you, the email names the startup
        and the role.
      </p>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        {/* The account is offered here rather than demanded at question one.
            It buys something real now — a place to see the decision — instead
            of standing between someone and a form they had not started. */}
        {!signedIn && (
          <Link
            href="/auth"
            className="ax-shine rounded-full bg-ink px-7 py-3.5 text-[0.95rem] font-medium text-white transition-transform duration-300 hover:-translate-y-0.5"
          >
            Make an account to track it
          </Link>
        )}
        <Link
          href={HOME_BY_SET[setKey]}
          className="text-[0.95rem] text-muted underline underline-offset-4 transition-colors hover:text-ink"
        >
          {signedIn ? "Back to your home" : "Look around first"}
        </Link>
      </div>
    </div>
  );
}
