"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { Option, Question } from "@/lib/apply-sections";
import { MAX_FILE } from "@/lib/apply-contract";
import { startups } from "@/lib/site-data";
import { joinValues, splitValues } from "@/components/onboarding/flow/useApplication";

/**
 * The inputs for the question flow, on the dark app surface.
 *
 * Big and few: one question on screen means the answer can be set at display
 * size, and a choice can be a card you hit with a letter key rather than a
 * dropdown you open. Every choice keeps the exact option string from the
 * question set — the value on the wire never changes, only the thing you
 * click.
 */

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/** Keys typed into a field belong to the field, not to the choice shortcuts. */
function isTyping(target: EventTarget | null) {
  const element = target as HTMLElement | null;
  return Boolean(
    element &&
      (element.tagName === "INPUT" ||
        element.tagName === "TEXTAREA" ||
        element.isContentEditable),
  );
}

function Counter({ value, max }: { value: string; max?: number }) {
  if (!max) return null;
  const near = value.length > max * 0.85;
  return (
    <span className={`text-[12px] tabular-nums ${near ? "text-app-accent" : "text-app-text-3"}`}>
      {value.length}/{max}
    </span>
  );
}

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
  const type = question.type === "url" ? "url" : (question.inputType ?? "text");

  return (
    <div>
      <input
        id={`f-${question.id}`}
        autoFocus
        type={type}
        value={value}
        maxLength={question.maxLength}
        placeholder={question.placeholder ?? "type your answer"}
        autoComplete={question.autocomplete}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key !== "Enter") return;
          event.preventDefault();
          onEnter();
        }}
        className="w-full rounded-none border-b border-app-line-strong bg-transparent pb-3 text-[24px] leading-[32px] tracking-[-0.3px] text-app-text-1 caret-app-accent outline-none placeholder:text-app-text-3/60 focus:border-app-accent/60 focus-visible:outline-none sm:text-[28px] sm:leading-[36px]"
      />
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
  const ref = useRef<HTMLTextAreaElement>(null);

  // Grows with the answer instead of scrolling inside itself, so a long
  // answer is read the way it will be read on the other end.
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    node.style.height = "auto";
    node.style.height = `${node.scrollHeight}px`;
  }, [value]);

  return (
    <div>
      <textarea
        ref={ref}
        id={`f-${question.id}`}
        autoFocus
        rows={3}
        value={value}
        maxLength={question.maxLength}
        placeholder={question.placeholder ?? "take your time"}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
            event.preventDefault();
            onEnter();
          }
        }}
        className="max-h-[42vh] min-h-[7.5rem] w-full resize-none rounded-[12px] bg-app-card px-4 py-3.5 text-[17px] leading-[26px] text-app-text-1 caret-app-accent shadow-[inset_0_0_0_1px_var(--color-app-line-strong)] outline-none placeholder:text-app-text-3/60 focus-visible:outline-none focus:shadow-[inset_0_0_0_1px_rgb(111_207_138_/_0.5)]"
      />
      <div className="mt-2 flex items-center justify-between gap-4 text-[12px] text-app-text-3">
        <span>⌘ + enter to continue</span>
        <Counter value={value} max={question.maxLength} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* choices                                                             */
/* ------------------------------------------------------------------ */

function choiceOptions(question: Question): Option[] {
  if (question.type === "yes_no") {
    return [
      { value: "yes", label: "yes" },
      { value: "no", label: "no" },
    ];
  }
  return question.options ?? [];
}

function ChoiceCard({
  letter,
  label,
  selected,
  onClick,
  multi,
}: {
  letter: string;
  label: string;
  selected: boolean;
  onClick: () => void;
  multi?: boolean;
}) {
  return (
    <button
      type="button"
      role={multi ? "checkbox" : "radio"}
      aria-checked={selected}
      onClick={onClick}
      className={`group flex w-full cursor-pointer items-center gap-3 rounded-[12px] px-3.5 py-3 text-left text-[15px] transition-[background-color,box-shadow,transform] duration-200 ease-button active:scale-[0.99] ${
        selected
          ? "bg-app-accent/[0.12] text-app-text-1 shadow-[inset_0_0_0_1px_rgb(111_207_138_/_0.55)]"
          : "bg-app-card text-app-text-2 shadow-[inset_0_0_0_1px_var(--color-app-line-strong)] hover:bg-app-hover"
      }`}
    >
      <span
        aria-hidden="true"
        className={`grid h-6 w-6 shrink-0 place-items-center rounded-[6px] text-[11px] font-semibold transition-colors duration-200 ${
          selected ? "bg-app-accent text-app-canvas" : "bg-app-sunken text-app-text-3"
        }`}
      >
        {selected && multi ? "✓" : letter}
      </span>
      <span className="min-w-0 flex-1">{label}</span>
    </button>
  );
}

export function FlowChoice({
  question,
  value,
  onChange,
  onAdvance,
}: {
  question: Question;
  value: string;
  onChange: (value: string) => void;
  /** Single choice moves on by itself once picked. */
  onAdvance: () => void;
}) {
  const options = choiceOptions(question);
  const advanceTimer = useRef<number | undefined>(undefined);
  // The advance runs after the answer has been stored and re-rendered, so it
  // must be the newest callback — the one from this render still sees the
  // question as unanswered and would fail its own validation.
  const advance = useRef(onAdvance);
  advance.current = onAdvance;

  function pick(next: string) {
    onChange(next);
    window.clearTimeout(advanceTimer.current);
    // Long enough to see the card light up, short enough to feel automatic.
    advanceTimer.current = window.setTimeout(() => advance.current(), 320);
  }

  useEffect(() => () => window.clearTimeout(advanceTimer.current), []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (isTyping(event.target) || event.metaKey || event.ctrlKey || event.altKey) return;
      const position = LETTERS.indexOf(event.key.toUpperCase());
      if (position < 0 || position >= options.length) return;
      event.preventDefault();
      pick(options[position].value);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div
      role="radiogroup"
      aria-labelledby={`q-${question.id}`}
      className={`grid gap-2 ${options.length > 5 ? "sm:grid-cols-2" : ""}`}
    >
      {options.map((option, index) => (
        <ChoiceCard
          key={option.value}
          letter={LETTERS[index]}
          label={option.label.toLowerCase()}
          selected={value === option.value}
          onClick={() => pick(option.value)}
        />
      ))}
    </div>
  );
}

export function FlowMulti({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: string;
  onChange: (value: string) => void;
}) {
  const options = question.options ?? [];
  const selected = splitValues(value);

  function toggle(option: string) {
    const next = selected.includes(option)
      ? selected.filter((entry) => entry !== option)
      : [...selected, option];
    onChange(joinValues(next));
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (isTyping(event.target) || event.metaKey || event.ctrlKey || event.altKey) return;
      const position = LETTERS.indexOf(event.key.toUpperCase());
      if (position < 0 || position >= options.length) return;
      event.preventDefault();
      toggle(options[position].value);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div role="group" aria-labelledby={`q-${question.id}`} className="grid gap-2 sm:grid-cols-2">
      {options.map((option, index) => (
        <ChoiceCard
          key={option.value}
          multi
          letter={LETTERS[index]}
          label={option.label.toLowerCase()}
          selected={selected.includes(option.value)}
          onClick={() => toggle(option.value)}
        />
      ))}
    </div>
  );
}

/**
 * startup_picks as the logo wall from the landing page, so the thing you pick
 * from here is the thing you were shown there. Values are the roster names
 * (plus "Other"), exactly as the question set defines them.
 */
export function FlowPicks({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: string;
  onChange: (value: string) => void;
}) {
  const selected = splitValues(value);
  const options = question.options ?? [];

  function toggle(option: string) {
    const next = selected.includes(option)
      ? selected.filter((entry) => entry !== option)
      : [...selected, option];
    onChange(joinValues(next));
  }

  return (
    <div role="group" aria-labelledby={`q-${question.id}`} className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
      {options.map((option) => {
        const startup = startups.find((entry) => entry.name === option.value);
        const isOn = selected.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            role="checkbox"
            aria-checked={isOn}
            onClick={() => toggle(option.value)}
            className={`relative flex aspect-square cursor-pointer flex-col items-center justify-center gap-2.5 rounded-[14px] px-2 transition-[background-color,box-shadow,transform] duration-200 ease-button active:scale-[0.97] ${
              isOn
                ? "bg-app-accent/[0.12] shadow-[inset_0_0_0_1px_rgb(111_207_138_/_0.6),0_0_28px_-6px_rgb(111_207_138_/_0.45)]"
                : "bg-app-card shadow-[inset_0_0_0_1px_var(--color-app-line-strong)] hover:bg-app-hover"
            }`}
          >
            {isOn ? (
              <span
                aria-hidden="true"
                className="ax-toast-in absolute top-2 right-2 grid h-4 w-4 place-items-center rounded-full bg-app-accent text-[9px] font-bold text-app-canvas"
              >
                ✓
              </span>
            ) : null}
            {startup?.logo ? (
              <span className="grid h-10 w-10 place-items-center rounded-[10px] bg-white p-1.5">
                <Image src={startup.logo} alt="" width={64} height={64} className="h-full w-full object-contain" />
              </span>
            ) : (
              <span
                aria-hidden="true"
                className="grid h-10 w-10 place-items-center rounded-[10px] bg-app-sunken font-display text-[18px] text-app-accent"
              >
                {startup
                  ? startup.name
                      .split(" ")
                      .slice(0, 2)
                      .map((word) => word[0])
                      .join("")
                  : "+"}
              </span>
            )}
            <span className="text-center text-[11px] leading-[14px] text-app-text-2">
              {startup ? startup.name : "other / open"}
            </span>
            {startup?.yc ? (
              <span className="-mt-1.5 text-[10px] text-app-text-3">{startup.yc}</span>
            ) : null}
          </button>
        );
      })}
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
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function take(candidate: File | undefined | null) {
    if (!candidate) return;
    if (candidate.size > MAX_FILE) {
      setError("that file is over 8MB — pick a smaller one.");
      onFile(null);
      return;
    }
    setError(null);
    onFile(candidate);
  }

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
        className={`flex min-h-[8.5rem] cursor-pointer flex-col items-center justify-center gap-2 rounded-[14px] border border-dashed px-6 py-8 text-center transition-colors duration-200 ${
          dragging
            ? "border-app-accent bg-app-accent/[0.08]"
            : "border-app-line-strong bg-app-card hover:bg-app-hover"
        }`}
      >
        <input
          id={`f-${question.id}`}
          type="file"
          accept={question.accept}
          className="sr-only"
          onChange={(event) => take(event.target.files?.[0])}
        />
        <span aria-hidden="true" className="text-[20px] text-app-accent">
          {file ? "✓" : "↥"}
        </span>
        <span className="text-[15px] text-app-text-1">
          {file ? file.name : "drop a file, or click to choose"}
        </span>
        <span className="text-[12px] text-app-text-3">
          {question.accept?.includes("image") ? "pdf, word or an image" : "pdf or word"}, up
          to 8MB
        </span>
      </label>
      {file ? (
        <button
          type="button"
          onClick={() => onFile(null)}
          className="mt-2 cursor-pointer text-[12px] text-app-text-3 transition-colors hover:text-app-text-1"
        >
          remove file
        </button>
      ) : null}
      {error ? <p className="mt-2 text-[13px] text-[#ff8a80]">{error}</p> : null}
    </div>
  );
}
