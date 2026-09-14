"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

export type ApplyPrefill = {
  name?: string;
  email?: string;
  /** True when a Supabase session already exists (Google or email login). */
  isSignedIn?: boolean;
};

export type SubmitResult = {
  ok: boolean;
  error?: string;
};

type Answers = Record<string, string>;

/**
 * Local record that this browser submitted an application. The server row is
 * the truth but is not always reachable — the mirror can fail, and the
 * applicant may never have signed in. Read alongside the server status, never
 * instead of it.
 */
export const submittedKey = (setKey: string) => `axiom_submitted_${setKey}`;

const HOME_BY_SET: Record<QuestionSet["key"], string> = {
  intern: "/home",
  startup: "/startup/home",
  chapter: "/chapter/home",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** A multi_checkbox answer is one comma-joined string on the wire. */
const splitValues = (value: string | undefined) =>
  value ? value.split(", ").filter(Boolean) : [];

function isVisible(question: Question, answers: Answers): boolean {
  const rule = question.conditional;
  if (!rule) return true;

  const parent = answers[rule.dependsOn] ?? "";
  if (rule.showWhen !== undefined) return parent === rule.showWhen;
  if (rule.showWhenOneOf) return rule.showWhenOneOf.includes(parent);
  if (rule.showWhenIncludes) return splitValues(parent).includes(rule.showWhenIncludes);
  return true;
}

function validate(question: Question, answers: Answers, files: Record<string, File>) {
  const value = (answers[question.id] ?? "").trim();

  if (question.type === "file") {
    // Files are never required in any set today, and a missing optional file
    // must not block the step.
    return question.required && !files[question.id] ? "Add a file to continue." : null;
  }

  if (question.required && !value) return "This one is required.";
  if (question.inputType === "email" && value && !EMAIL_PATTERN.test(value)) {
    return "That email does not look right.";
  }
  return null;
}

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
  onSubmit: (answers: Answers, files: Record<string, File>) => Promise<SubmitResult>;
}) {
  const [answers, setAnswers] = useState<Answers>({});
  const [files, setFiles] = useState<Record<string, File>>({});
  const [index, setIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [restored, setRestored] = useState(false);
  const headingRef = useRef<HTMLDivElement>(null);

  // Flattened once per answer change: a conditional question appears and
  // disappears as its parent is answered, and the step count has to follow.
  const questions = useMemo(() => {
    const flat: { question: Question; section: string }[] = [];
    for (const section of set.sections) {
      for (const question of section.questions) {
        if (isVisible(question, answers)) {
          flat.push({ question, section: section.nav });
        }
      }
    }
    return flat;
  }, [set, answers]);

  // Draft restore. Files cannot survive a reload, so only answers persist —
  // and the applicant is told as much on the files step rather than finding
  // out by submitting without one.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(set.storageKey);
      if (raw) setAnswers(JSON.parse(raw) as Answers);
    } catch {
      // A corrupt or unreadable draft is not worth failing the page over.
    }
    setRestored(true);
  }, [set.storageKey]);

  // Prefill never overwrites a real answer: a restored draft is what the
  // applicant typed, and the session's name is only a guess at it.
  useEffect(() => {
    if (!restored || !prefill) return;
    setAnswers((current) => ({
      [set.gate.nameId]: prefill.name ?? "",
      [set.gate.emailId]: prefill.email ?? "",
      ...current,
    }));
  }, [restored, prefill, set.gate.nameId, set.gate.emailId]);

  useEffect(() => {
    if (!restored) return;
    try {
      localStorage.setItem(set.storageKey, JSON.stringify(answers));
    } catch {
      // Private mode, quota — the form still works, it just will not resume.
    }
  }, [answers, restored, set.storageKey]);

  const total = questions.length;
  const onReview = index >= total;
  const current = questions[index];

  const setAnswer = useCallback((id: string, value: string) => {
    setAnswers((previous) => ({ ...previous, [id]: value }));
    setError(null);
  }, []);

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
    setSubmitting(true);
    setError(null);

    const result = await onSubmit(answers, files);

    if (!result.ok) {
      setError(result.error ?? "That did not send. Try once more.");
      setSubmitting(false);
      return;
    }

    try {
      localStorage.setItem(submittedKey(set.key), new Date().toISOString());
      localStorage.removeItem(set.storageKey);
    } catch {
      // Nothing here is load-bearing; the submission already landed.
    }

    setSubmitted(true);
    setSubmitting(false);
  }

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
    <div className={`apply-${variant} ${shell}`}>
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
                {current.section}
              </p>
            </div>

            <QuestionField
              question={current.question}
              answers={answers}
              files={files}
              error={error ?? undefined}
              onAnswer={setAnswer}
              onFile={(id, file) =>
                setFiles((previous) => {
                  const next = { ...previous };
                  if (file) next[id] = file;
                  else delete next[id];
                  return next;
                })
              }
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

      {error && onReview && (
        <p className="mt-4 text-right font-mono text-[0.68rem] tracking-[0.08em] text-error uppercase">
          {error}
        </p>
      )}

      {!onReview && (
        <p className="mt-6 text-center font-mono text-[0.62rem] tracking-[0.12em] text-faint uppercase">
          Saved as you go · press Enter to continue
        </p>
      )}
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
  files: Record<string, File>;
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
  questions: { question: Question; section: string }[];
  answers: Answers;
  files: Record<string, File>;
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
