"use client";

import { useEffect, useRef, useState } from "react";
import type { Question } from "@/lib/apply-sections";
import { MAX_FILE } from "@/lib/apply-contract";
import { useFullLook } from "@/components/onboarding/flow/look";

export { FlowChoice, FlowMulti, FlowPicks } from "@/components/onboarding/flow/choices";

/**
 * The typed inputs for the question flow: a line, a long answer, a file.
 * (Choices live in choices.tsx.)
 *
 * Big and few: one question on screen means the answer can be set at display
 * size. On the full-page flow a line is the welcome page's white pill, the
 * same size as its Continue buttons, and a long answer is one of its white
 * cards; embedded in the dark workspace they keep the dark field look.
 */

function Counter({ value, max }: { value: string; max?: number }) {
  const full = useFullLook();
  if (!max) return null;
  const near = value.length > max * 0.85;
  const tone = full
    ? near
      ? "text-ms-green"
      : "text-ms-muted"
    : near
      ? "text-app-accent"
      : "text-app-text-3";
  return (
    <span className={`text-[12px] tabular-nums ${tone}`}>
      {value.length}/{max}
    </span>
  );
}

/** The soft lift every white field on the full-page flow sits on. */
const FIELD_SHADOW = "shadow-[0_10px_30px_-18px_rgb(23_25_28_/_0.4)]";
/** Focus draws a path-coloured ring outside the field, keeping the lift. */
const FIELD_FOCUS =
  "focus-within:shadow-[0_0_0_2px_var(--color-ms-green),0_10px_30px_-18px_rgb(23_25_28_/_0.4)]";

/* ------------------------------------------------------------------ */
/* text                                                                */
/* ------------------------------------------------------------------ */

export function FlowText({
  question,
  value,
  onChange,
  onEnter,
}: {
  question: Question;
  value: string;
  onChange: (value: string) => void;
  onEnter: () => void;
}) {
  const full = useFullLook();
  const type = question.type === "url" ? "url" : (question.inputType ?? "text");

  const input = (
    <input
      id={`f-${question.id}`}
      autoFocus
      type={type}
      value={value}
      maxLength={question.maxLength}
      placeholder={question.placeholder ?? "Type your answer"}
      autoComplete={question.autocomplete}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={(event) => {
        if (event.key !== "Enter") return;
        event.preventDefault();
        onEnter();
      }}
      className={
        full
          ? "h-16 w-full min-w-0 flex-1 bg-transparent text-[19px] text-ms-ink caret-ms-green outline-none placeholder:text-ms-muted focus-visible:outline-none sm:text-[20px]"
          : "w-full rounded-none border-b border-app-line-strong bg-transparent pb-3 text-[24px] leading-[32px] tracking-[-0.3px] text-app-text-1 caret-app-accent outline-none placeholder:text-app-text-3/60 focus:border-app-accent/60 focus-visible:outline-none sm:text-[28px] sm:leading-[36px]"
      }
    />
  );

  if (full) {
    return (
      <div>
        <div
          className={`flex items-center gap-3 rounded-full bg-white px-7 transition-shadow duration-300 ${FIELD_SHADOW} ${FIELD_FOCUS}`}
        >
          {input}
          <Counter value={value} max={question.maxLength} />
        </div>
      </div>
    );
  }

  return (
    <div>
      {input}
      <div className="mt-2 flex justify-end">
        <Counter value={value} max={question.maxLength} />
      </div>
    </div>
  );
}

export function FlowTextArea({
  question,
  value,
  onChange,
  onEnter,
}: {
  question: Question;
  value: string;
  onChange: (value: string) => void;
  onEnter: () => void;
}) {
  const full = useFullLook();
  const ref = useRef<HTMLTextAreaElement>(null);

  // Grows with the answer instead of scrolling inside itself, so a long
  // answer is read the way it will be read on the other end.
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    node.style.height = "auto";
    node.style.height = `${node.scrollHeight}px`;
  }, [value]);

  const textarea = (
    <textarea
      ref={ref}
      id={`f-${question.id}`}
      autoFocus
      rows={3}
      value={value}
      maxLength={question.maxLength}
      placeholder={question.placeholder ?? "Take your time"}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
          event.preventDefault();
          onEnter();
        }
      }}
      className={
        full
          ? "block max-h-[42vh] min-h-[8.5rem] w-full resize-none bg-transparent px-6 pt-5 pb-2 text-[18px] leading-[28px] text-ms-ink caret-ms-green outline-none placeholder:text-ms-muted focus-visible:outline-none"
          : "max-h-[42vh] min-h-[7.5rem] w-full resize-none rounded-[12px] bg-app-card px-4 py-3.5 text-[17px] leading-[26px] text-app-text-1 caret-app-accent shadow-[inset_0_0_0_1px_var(--color-app-line-strong)] outline-none placeholder:text-app-text-3/60 focus-visible:outline-none focus:shadow-[inset_0_0_0_1px_rgb(135_183_148_/_0.5)]"
      }
    />
  );

  if (full) {
    return (
      <div className={`rounded-[28px] bg-white transition-shadow duration-300 ${FIELD_SHADOW} ${FIELD_FOCUS}`}>
        {textarea}
        <div className="flex items-center justify-between gap-4 px-6 pb-4 text-[12px] text-ms-muted">
          <span>⌘ + Enter to continue</span>
          <Counter value={value} max={question.maxLength} />
        </div>
      </div>
    );
  }

  return (
    <div>
      {textarea}
      <div className="mt-2 flex items-center justify-between gap-4 text-[12px] text-app-text-3">
        <span>⌘ + Enter to continue</span>
        <Counter value={value} max={question.maxLength} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* file                                                                */
/* ------------------------------------------------------------------ */

export function FlowFile({
  question,
  file,
  onFile,
}: {
  question: Question;
  file: File | null;
  onFile: (file: File | null) => void;
}) {
  const full = useFullLook();
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function take(candidate: File | undefined | null) {
    if (!candidate) return;
    if (candidate.size > MAX_FILE) {
      setError("That file is over 8MB — pick a smaller one.");
      onFile(null);
      return;
    }
    setError(null);
    onFile(candidate);
  }

  const zone = full
    ? `flex min-h-[10rem] cursor-pointer flex-col items-center justify-center gap-2 rounded-[28px] border-2 border-dashed px-6 py-8 text-center transition-[background-color,border-color,transform] duration-300 ease-ms focus-within:border-ms-green ${
        dragging
          ? "scale-[1.01] border-ms-green bg-white"
          : file
            ? `border-transparent bg-white ${FIELD_SHADOW}`
            : "border-white bg-white/55 hover:bg-white/80"
      }`
    : `flex min-h-[8.5rem] cursor-pointer flex-col items-center justify-center gap-2 rounded-[14px] border border-dashed px-6 py-8 text-center transition-colors duration-200 ${
        dragging
          ? "border-app-accent bg-app-accent/[0.08]"
          : "border-app-line-strong bg-app-card hover:bg-app-hover"
      }`;

  return (
    <div>
      <label
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          take(event.dataTransfer.files?.[0]);
        }}
        className={zone}
      >
        <input
          id={`f-${question.id}`}
          type="file"
          accept={question.accept}
          className="sr-only"
          onChange={(event) => take(event.target.files?.[0])}
        />
        <span
          aria-hidden="true"
          className={
            full
              ? `grid h-12 w-12 place-items-center rounded-full text-[20px] ${
                  file ? "ax-toast-in bg-ms-green text-white" : "bg-white text-ms-green"
                }`
              : "text-[20px] text-app-accent"
          }
        >
          {file ? "✓" : "↥"}
        </span>
        <span className={full ? "mt-1 text-[16px] font-medium text-ms-ink" : "text-[15px] text-app-text-1"}>
          {file ? file.name : "Drop a file, or click to choose"}
        </span>
        <span className={full ? "text-[13px] text-ms-body" : "text-[12px] text-app-text-3"}>
          {question.accept?.includes("image") ? "PDF, Word or an image" : "PDF or Word"}, up
          to 8MB
        </span>
      </label>
      {file ? (
        <button
          type="button"
          onClick={() => onFile(null)}
          className={
            full
              ? "mt-3 cursor-pointer text-[14px] text-ms-body underline underline-offset-4 transition-opacity hover:opacity-60"
              : "mt-2 cursor-pointer text-[12px] text-app-text-3 transition-colors hover:text-app-text-1"
          }
        >
          Remove file
        </button>
      ) : null}
      {error ? (
        <p role="alert" className="mt-2 text-[13px] text-[#ff8a80] [.ms-flow_&]:text-[#b3261e]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
