"use client";

import type { CSSProperties, ReactNode } from "react";
import type { Question, Section } from "@/lib/apply-sections";
import { TEXTAREA_HINT } from "@/lib/apply-sections";
import { RiseWords, rise, riseEnd } from "@/components/onboarding/flow/RiseWords";

/**
 * One question on the full-page flow, set like the welcome page: a small
 * path-coloured dot and the section's name, the question itself in the
 * display cut rising word by word, one line of help, the answer, and a
 * black pill to move on. Everything after the question rises in behind its
 * last word, so each screen assembles the way the home hero does.
 *
 * Going back (`direction` -1) everything comes down from above instead.
 */
export function FullQuestion({
  question,
  section,
  direction,
  reaction,
  error,
  isLast,
  canGoBack,
  onNext,
  onBack,
  children,
}: {
  question: Question;
  section: Section;
  direction: 1 | -1;
  reaction: string | null;
  error: string | null;
  isLast: boolean;
  canGoBack: boolean;
  onNext: () => void;
  onBack: () => void;
  /** The answer input. */
  children: ReactNode;
}) {
  const help = question.helpText ?? (question.type === "textarea" ? TEXTAREA_HINT : null);
  const labelStart = 60;
  const after = riseEnd(question.label, labelStart) + 120;

  return (
    <div style={{ "--dir": direction } as CSSProperties}>
      {reaction && direction === 1 ? (
        <p
          key={reaction}
          className="flow-rise mb-8 inline-flex items-center gap-2.5 rounded-full bg-white/70 py-2 pr-4 pl-3 text-[14px] text-ms-ink shadow-[0_6px_18px_-12px_rgb(23_25_28_/_0.35)]"
        >
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[var(--path-em)]" />
          {reaction}
        </p>
      ) : null}

      <p className="flow-rise flex items-center gap-2.5 text-[14px] font-medium text-ms-body" style={rise(0)}>
        <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-[var(--path-em)]" />
        {section.nav}
        {question.required ? null : (
          <span className="rounded-full bg-white/55 px-2.5 py-0.5 text-[12px]">Optional</span>
        )}
      </p>

      <h2
        id={`q-${question.id}`}
        className="ms-display mt-4 text-[clamp(2.25rem,3.4vw,3.35rem)] text-balance text-ms-ink"
        style={{ lineHeight: 1.02 }}
      >
        <label htmlFor={`f-${question.id}`}>
          <RiseWords text={question.label} start={labelStart} />
        </label>
      </h2>

      {help ? (
        <p className="flow-rise mt-4 max-w-[44ch] text-[17px] leading-[1.45] text-pretty text-ms-body" style={rise(after)}>
          {help}
        </p>
      ) : null}

      <div className="flow-rise mt-8" style={rise(after + 80)}>
        {children}
      </div>

      {error ? (
        <p
          role="alert"
          className="flow-rise mt-4 inline-flex items-center gap-2 rounded-full bg-white py-2 pr-4 pl-3 text-[14px] text-[#b3261e]"
        >
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[#b3261e]" />
          {error}
        </p>
      ) : null}

      <div className="flow-rise mt-9 flex items-center gap-6" style={rise(after + 160)}>
        <button type="button" onClick={onNext} className="ms-pill cursor-pointer">
          {isLast ? "Review" : "OK"}
          <span aria-hidden="true" className="text-white/60">
            ↵
          </span>
        </button>
        {canGoBack ? (
          <button
            type="button"
            onClick={onBack}
            className="cursor-pointer text-[15px] text-ms-body underline underline-offset-4 transition-opacity hover:opacity-60"
          >
            Back
          </button>
        ) : null}
      </div>
    </div>
  );
}
