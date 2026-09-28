"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent } from "react";
import Image from "next/image";
import type { Option, Question } from "@/lib/apply-sections";
import { startups } from "@/lib/site-data";
import { useFullLook } from "@/components/onboarding/flow/look";
import { joinValues, splitValues } from "@/components/onboarding/flow/useApplication";

/**
 * The choice inputs: single choice, multi choice, and the startup picks.
 *
 * On the full-page flow a choice is the welcome page's path picker grown to
 * fit the question — a soft track of options with the white thumb sliding to
 * the one you pick. Multi choice gives every picked option its own thumb.
 * Embedded in the dark workspace they stay the lettered cards they were.
 *
 * Every option keeps its exact string from the question set: the value on
 * the wire never changes, only the thing you click. Letter keys pick, and
 * the arrow keys walk the options.
 */

export const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/** How long a picked single choice waits before moving on: the thumb lands first. */
const ADVANCE_MS = 420;

/** Keys typed into a field belong to the field, not to the choice shortcuts. */
export function isTyping(target: EventTarget | null) {
  const element = target as HTMLElement | null;
  return Boolean(
    element &&
      (element.tagName === "INPUT" ||
        element.tagName === "TEXTAREA" ||
        element.isContentEditable),
  );
}

/** Arrow keys move focus through a group's options, wrapping at the ends. */
function walkOptions(event: ReactKeyboardEvent<HTMLElement>) {
  const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[event.key];
  if (!step) return;
  const options = [...event.currentTarget.querySelectorAll<HTMLElement>("[data-option]")];
  const at = options.indexOf(document.activeElement as HTMLElement);
  const next = options[(Math.max(at, step > 0 ? -1 : 0) + step + options.length) % options.length];
  if (!next) return;
  event.preventDefault();
  next.focus();
}

function useLetterKeys(count: number, onLetter: (index: number) => void) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (isTyping(event.target) || event.metaKey || event.ctrlKey || event.altKey) return;
      const position = LETTERS.indexOf(event.key.toUpperCase());
      if (position < 0 || position >= count) return;
      event.preventDefault();
      onLetter(position);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });
}

/** yes_no keeps its lowercase wire values; only the labels take a capital. */
function choiceOptions(question: Question): Option[] {
  if (question.type === "yes_no") {
    return [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ];
  }
  return question.options ?? [];
}

/* ------------------------------------------------------------------ */
/* the full-page track                                                 */
/* ------------------------------------------------------------------ */

/**
 * How the options sit in the track. Two short options share one row, like
 * the path picker; long lists fold into two columns from `sm` up. Rows are
 * equal height (auto-rows-fr) so a thumb one cell tall fits every option.
 */
function trackShape(count: number) {
  const inline = count <= 2;
  const twoUp = count > 5;
  return {
    inline,
    twoUp,
    rows: inline ? 1 : count,
    rowsTwoUp: Math.ceil(count / 2),
    grid: inline ? "grid-cols-2" : twoUp ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1",
    radius: inline ? "rounded-full" : "rounded-[30px]",
    thumbRadius: inline ? "rounded-full" : "rounded-[26px]",
  };
}

/** One option's cell in the track: its letter, its label, no fill of its own. */
function TrackOption({
  letter,
  label,
  selected,
  multi,
  onClick,
}: {
  letter: string;
  label: string;
  selected: boolean;
  multi?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      data-option
      role={multi ? "checkbox" : "radio"}
      aria-checked={selected}
      tabIndex={0}
      onClick={onClick}
      className="group relative z-10 flex min-h-14 w-full cursor-pointer items-center gap-3 rounded-[26px] px-4 py-2.5 text-left text-[16px] font-medium text-ms-ink transition-transform duration-300 ease-ms active:scale-[0.985]"
    >
      <span
        aria-hidden="true"
        className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[12px] font-semibold transition-colors duration-300 ${
          selected ? "bg-ms-green text-white" : "bg-white/75 text-ms-body group-hover:bg-white"
        }`}
      >
        {selected && multi ? "✓" : letter}
      </span>
      <span className="min-w-0 flex-1">{label}</span>
    </button>
  );
}

function ChoiceTrack({
  question,
  options,
  value,
  pick,
}: {
  question: Question;
  options: Option[];
  value: string;
  pick: (value: string) => void;
}) {
  const shape = trackShape(options.length);
  const at = options.findIndex((option) => option.value === value);
  const shown = at >= 0;

  // The thumb is one cell: it slides by whole cells, so a percentage
  // translate of its own size lands exactly on the next option.
  const thumbStyle = {
    "--r": shape.inline ? 0 : Math.max(at, 0),
    "--c": shape.inline ? Math.max(at, 0) : 0,
    "--r2": Math.floor(Math.max(at, 0) / 2),
    "--c2": Math.max(at, 0) % 2,
    "--rows": shape.rows,
    "--rows2": shape.rowsTwoUp,
  } as CSSProperties;

  return (
    <div
      role="radiogroup"
      aria-labelledby={`q-${question.id}`}
      onKeyDown={walkOptions}
      className={`relative grid auto-rows-fr bg-white/55 p-[3px] ${shape.grid} ${shape.radius} ${
        shape.inline ? "max-w-[26rem]" : ""
      }`}
    >
      <span
        aria-hidden="true"
        data-shown={shown}
        style={thumbStyle}
        className={`flow-thumb pointer-events-none absolute top-[3px] left-[3px] ${
          shape.inline ? "flow-thumb-inline" : shape.twoUp ? "flow-thumb-two" : "flow-thumb-stack"
        }`}
      >
        <span
          className={`absolute inset-[3px] bg-white shadow-[0_6px_18px_-8px_rgb(23_25_28_/_0.35)] ${shape.thumbRadius}`}
        />
      </span>
      {options.map((option, index) => (
        <TrackOption
          key={option.value}
          letter={LETTERS[index]}
          label={option.label}
          selected={value === option.value}
          onClick={() => pick(option.value)}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* the embedded cards                                                  */
/* ------------------------------------------------------------------ */

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
      data-option
      role={multi ? "checkbox" : "radio"}
      aria-checked={selected}
      onClick={onClick}
      className={`group flex w-full cursor-pointer items-center gap-3 rounded-[12px] px-3.5 py-3 text-left text-[15px] transition-[background-color,box-shadow,transform] duration-200 ease-button active:scale-[0.99] ${
        selected
          ? "bg-app-accent/[0.12] text-app-text-1 shadow-[inset_0_0_0_1px_rgb(135_183_148_/_0.55)]"
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

/* ------------------------------------------------------------------ */
/* single and multi choice                                             */
/* ------------------------------------------------------------------ */

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
  const full = useFullLook();
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
    advanceTimer.current = window.setTimeout(() => advance.current(), ADVANCE_MS);
  }

  useEffect(() => () => window.clearTimeout(advanceTimer.current), []);
  useLetterKeys(options.length, (index) => pick(options[index].value));

  if (full) return <ChoiceTrack question={question} options={options} value={value} pick={pick} />;

  return (
    <div
      role="radiogroup"
      aria-labelledby={`q-${question.id}`}
      onKeyDown={walkOptions}
      className={`grid gap-2 ${options.length > 5 ? "sm:grid-cols-2" : ""}`}
    >
      {options.map((option, index) => (
        <ChoiceCard
          key={option.value}
          letter={LETTERS[index]}
          label={option.label}
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
  const full = useFullLook();
  const options = question.options ?? [];
  const selected = splitValues(value);

  function toggle(option: string) {
    const next = selected.includes(option)
      ? selected.filter((entry) => entry !== option)
      : [...selected, option];
    onChange(joinValues(next));
  }

  useLetterKeys(options.length, (index) => toggle(options[index].value));

  if (full) {
    return (
      <div
        role="group"
        aria-labelledby={`q-${question.id}`}
        onKeyDown={walkOptions}
        className="grid auto-rows-fr grid-cols-1 rounded-[30px] bg-white/55 p-[3px] sm:grid-cols-2"
      >
        {options.map((option, index) => {
          const isOn = selected.includes(option.value);
          return (
            <div key={option.value} className="relative">
              {/* Each pick gets its own thumb, popping in where it was picked. */}
              <span
                aria-hidden="true"
                data-shown={isOn}
                className="flow-pop pointer-events-none absolute inset-[3px] rounded-[26px] bg-white shadow-[0_6px_18px_-8px_rgb(23_25_28_/_0.35)]"
              />
              <TrackOption
                multi
                letter={LETTERS[index]}
                label={option.label}
                selected={isOn}
                onClick={() => toggle(option.value)}
              />
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div
      role="group"
      aria-labelledby={`q-${question.id}`}
      onKeyDown={walkOptions}
      className="grid gap-2 sm:grid-cols-2"
    >
      {options.map((option, index) => (
        <ChoiceCard
          key={option.value}
          multi
          letter={LETTERS[index]}
          label={option.label}
          selected={selected.includes(option.value)}
          onClick={() => toggle(option.value)}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* startup picks                                                       */
/* ------------------------------------------------------------------ */

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
  const full = useFullLook();
  const selected = splitValues(value);
  const options = question.options ?? [];

  function toggle(option: string) {
    const next = selected.includes(option)
      ? selected.filter((entry) => entry !== option)
      : [...selected, option];
    onChange(joinValues(next));
  }

  const tile = (isOn: boolean) =>
    full
      ? `relative flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-[22px] px-1.5 transition-[transform,background-color,box-shadow] duration-300 ease-ms hover:-translate-y-0.5 active:scale-[0.97] ${
          isOn
            ? "bg-white shadow-[inset_0_0_0_2px_var(--color-ms-green),0_14px_28px_-16px_rgb(23_25_28_/_0.45)]"
            : "bg-white/55 hover:bg-white/85"
        }`
      : `relative flex aspect-square cursor-pointer flex-col items-center justify-center gap-2.5 rounded-[14px] px-2 transition-[background-color,box-shadow,transform] duration-200 ease-button active:scale-[0.97] ${
          isOn
            ? "bg-app-accent/[0.12] shadow-[inset_0_0_0_1px_rgb(135_183_148_/_0.6),0_0_28px_-6px_rgb(135_183_148_/_0.45)]"
            : "bg-app-card shadow-[inset_0_0_0_1px_var(--color-app-line-strong)] hover:bg-app-hover"
        }`;

  return (
    <div
      role="group"
      aria-labelledby={`q-${question.id}`}
      onKeyDown={walkOptions}
      className={`grid grid-cols-3 gap-2 ${full ? "sm:grid-cols-5" : "sm:grid-cols-4 lg:grid-cols-5"}`}
    >
      {options.map((option) => {
        const startup = startups.find((entry) => entry.name === option.value);
        const isOn = selected.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            data-option
            role="checkbox"
            aria-checked={isOn}
            onClick={() => toggle(option.value)}
            className={tile(isOn)}
          >
            {isOn ? (
              <span
                aria-hidden="true"
                className={
                  full
                    ? "ax-toast-in absolute top-2 right-2 grid h-5 w-5 place-items-center rounded-full bg-ms-green text-[10px] font-bold text-white"
                    : "ax-toast-in absolute top-2 right-2 grid h-4 w-4 place-items-center rounded-full bg-app-accent text-[9px] font-bold text-app-canvas"
                }
              >
                ✓
              </span>
            ) : null}
            {startup?.logo ? (
              <span
                className={`grid h-10 w-10 place-items-center bg-white p-1.5 ${
                  full ? "rounded-[12px] shadow-[inset_0_0_0_1px_rgb(23_25_28_/_0.08)]" : "rounded-[10px]"
                }`}
              >
                <Image src={startup.logo} alt="" width={64} height={64} className="h-full w-full object-contain" />
              </span>
            ) : (
              <span
                aria-hidden="true"
                className={
                  full
                    ? "grid h-10 w-10 place-items-center rounded-[12px] bg-ms-sky-soft text-[16px] font-semibold tracking-[-0.03em] text-ms-green"
                    : "grid h-10 w-10 place-items-center rounded-[10px] bg-app-sunken font-display text-[18px] text-app-accent"
                }
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
            <span
              className={
                full
                  ? "text-center text-[11.5px] leading-[14px] font-medium text-ms-ink"
                  : "text-center text-[11px] leading-[14px] text-app-text-2"
              }
            >
              {startup ? startup.name : "Other / open"}
            </span>
            {startup?.yc ? (
              <span className={`-mt-1.5 text-[10px] ${full ? "text-ms-body" : "text-app-text-3"}`}>{startup.yc}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
