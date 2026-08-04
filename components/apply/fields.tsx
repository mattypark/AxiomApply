"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Rule } from "@/components/apply/Rule";
import type { Option } from "@/lib/apply-sections";
import { MAX_FILE } from "@/lib/apply-contract";

/**
 * Field primitives for the apply engine.
 *
 * Editorial, not glass: flat white ground, ink type, JetBrains Mono for the
 * small tracked labels, forest for anything actionable. Separation comes from
 * the line-fill rules (components/apply/Rule.tsx) — no boxes, no cards.
 */

const INPUT =
  "w-full bg-transparent pb-2 pt-1 text-[1rem] leading-relaxed text-ink outline-none placeholder:text-faint";

type FieldShellProps = {
  id: string;
  label: string;
  required?: boolean;
  helpText?: string;
  error?: string;
  children: ReactNode;
};

export function FieldShell({
  id,
  label,
  required,
  helpText,
  error,
  children,
}: FieldShellProps) {
  return (
    <div className="w-full scroll-mt-24" id={id}>
      <label
        htmlFor={`f-${id}`}
        className="block text-[0.95rem] font-medium leading-snug tracking-tight text-ink"
      >
        {label}
        {required && (
          <span aria-hidden className="ml-1 text-forest">
            *
          </span>
        )}
      </label>
      {helpText && (
        <p className="mt-1 max-w-[52ch] text-[0.82rem] leading-relaxed text-muted">
          {helpText}
        </p>
      )}
      <div className="mt-3">{children}</div>
      {error && (
        <p className="mt-2 font-mono text-[0.68rem] tracking-[0.08em] text-error uppercase">
          {error}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* text + textarea                                                     */
/* ------------------------------------------------------------------ */

type TextFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email" | "tel" | "url" | "password";
  placeholder?: string;
  required?: boolean;
  helpText?: string;
  error?: string;
  maxLength?: number;
  autoComplete?: string;
};

export function TextField({
  id,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
  helpText,
  error,
  maxLength,
  autoComplete,
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <FieldShell
      id={id}
      label={label}
      required={required}
      helpText={helpText}
      error={error}
    >
      <input
        id={`f-${id}`}
        name={id}
        type={type}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(event) => onChange(event.target.value)}
        className={INPUT}
      />
      <Rule active={focused} />
      {maxLength && (
        <p className="mt-1.5 text-right font-mono text-[0.66rem] tracking-[0.08em] text-faint">
          {value.length}/{maxLength}
        </p>
      )}
    </FieldShell>
  );
}

export function TextArea({
  id,
  label,
  value,
  onChange,
  placeholder,
  required,
  helpText,
  error,
  maxLength,
}: Omit<TextFieldProps, "type" | "autoComplete">) {
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);

  // Grow with the answer. Long answers are the point of this form; a scrollbar
  // inside a 3-row box hides what the applicant just wrote.
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    element.style.height = "auto";
    element.style.height = `${element.scrollHeight}px`;
  }, [value]);

  return (
    <FieldShell
      id={id}
      label={label}
      required={required}
      helpText={helpText}
      error={error}
    >
      <textarea
        id={`f-${id}`}
        name={id}
        ref={ref}
        rows={2}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(event) => onChange(event.target.value)}
        className={`${INPUT} resize-none overflow-hidden`}
      />
      <Rule active={focused} />
      {maxLength && (
        <p className="mt-1.5 text-right font-mono text-[0.66rem] tracking-[0.08em] text-faint">
          {value.length}/{maxLength}
        </p>
      )}
    </FieldShell>
  );
}

/* ------------------------------------------------------------------ */
/* select                                                              */
/* ------------------------------------------------------------------ */

type SelectFieldProps = {
  id: string;
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  helpText?: string;
  error?: string;
};

export function SelectField({
  id,
  label,
  options,
  value,
  onChange,
  placeholder = "Select…",
  required,
  helpText,
  error,
}: SelectFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKey);
    };
  }, [isOpen]);

  const selected = options.find((option) => option.value === value);

  return (
    <FieldShell
      id={id}
      label={label}
      required={required}
      helpText={helpText}
      error={error}
    >
      <div className="relative" ref={containerRef}>
        <button
          id={`f-${id}`}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
          className="flex w-full cursor-pointer items-center justify-between gap-3 bg-transparent pb-2 pt-1 text-left text-[1rem] text-ink outline-none"
        >
          <span className={selected ? "" : "text-faint"}>
            {selected?.label ?? placeholder}
          </span>
          <span
            aria-hidden
            className={`text-[0.7rem] text-muted transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isOpen ? "-rotate-180" : ""
            }`}
          >
            ▾
          </span>
        </button>
        <Rule active={isOpen} />

        {isOpen && (
          <ul
            role="listbox"
            className="absolute left-0 right-0 top-full z-40 mt-2 max-h-64 overflow-y-auto rounded-2xl bg-[var(--ap-surface)] py-1.5 shadow-[var(--shadow-hover)]"
          >
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <li key={option.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={`w-full cursor-pointer px-5 py-2.5 text-left text-[0.95rem] transition-colors duration-200 ${
                      isSelected
                        ? "bg-forest/10 text-forest-deep"
                        : "text-ink hover:bg-ink/[0.04]"
                    }`}
                  >
                    {option.label}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </FieldShell>
  );
}

/* ------------------------------------------------------------------ */
/* yes / no + multi-checkbox                                           */
/* ------------------------------------------------------------------ */

const CHOICE =
  "cursor-pointer rounded-full px-6 py-2 font-mono text-[0.72rem] tracking-[0.12em] uppercase transition-[background-color,color,box-shadow] duration-300";

export function YesNoField({
  id,
  label,
  value,
  onChange,
  required,
  helpText,
  error,
}: Omit<TextFieldProps, "type" | "placeholder" | "maxLength" | "autoComplete">) {
  return (
    <FieldShell
      id={id}
      label={label}
      required={required}
      helpText={helpText}
      error={error}
    >
      <div className="flex gap-2.5">
        {["yes", "no"].map((choice) => (
          <button
            key={choice}
            type="button"
            aria-pressed={value === choice}
            onClick={() => onChange(choice)}
            className={`${CHOICE} ${
              value === choice
                ? "bg-forest text-white shadow-[0_8px_24px_rgba(47,107,61,0.28)]"
                : "text-muted shadow-[inset_0_0_0_1px_var(--ap-line)] hover:text-ink hover:shadow-[inset_0_0_0_1px_var(--ap-line-strong)]"
            }`}
          >
            {choice}
          </button>
        ))}
      </div>
    </FieldShell>
  );
}

type MultiCheckboxProps = {
  id: string;
  label: string;
  options: Option[];
  values: string[];
  onChange: (values: string[]) => void;
  required?: boolean;
  helpText?: string;
  error?: string;
};

export function MultiCheckboxField({
  id,
  label,
  options,
  values,
  onChange,
  required,
  helpText,
  error,
}: MultiCheckboxProps) {
  function toggle(value: string) {
    onChange(
      values.includes(value)
        ? values.filter((item) => item !== value)
        : [...values, value],
    );
  }

  return (
    <FieldShell
      id={id}
      label={label}
      required={required}
      helpText={helpText}
      error={error}
    >
      <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
        {options.map((option) => {
          const isChecked = values.includes(option.value);

          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isChecked}
              onClick={() => toggle(option.value)}
              className="group flex cursor-pointer items-center gap-3 py-3 text-left"
            >
              <span
                aria-hidden
                className={`grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[6px] text-[0.6rem] text-white transition-[background-color,box-shadow] duration-300 ${
                  isChecked
                    ? "bg-forest shadow-[0_4px_12px_rgba(47,107,61,0.3)]"
                    : "shadow-[inset_0_0_0_1px_var(--ap-line)] group-hover:shadow-[inset_0_0_0_1px_var(--ap-line-strong)]"
                }`}
              >
                {isChecked ? "✓" : ""}
              </span>
              <span
                className={`text-[0.95rem] transition-colors duration-200 ${
                  isChecked ? "text-ink" : "text-muted group-hover:text-ink"
                }`}
              >
                {option.label}
              </span>
            </button>
          );
        })}
      </div>
      <Rule />
    </FieldShell>
  );
}

/* ------------------------------------------------------------------ */
/* file                                                                */
/* ------------------------------------------------------------------ */

type FileFieldProps = {
  id: string;
  label: string;
  file: File | null;
  onFile: (file: File | null) => void;
  accept?: string;
  helpText?: string;
};

export function FileField({
  id,
  label,
  file,
  onFile,
  accept,
  helpText,
}: FileFieldProps) {
  const [isDragging, setIsDragging] = useState(false);
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

  return (
    <FieldShell id={id} label={label} helpText={helpText} error={error ?? undefined}>
      <label
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          take(event.dataTransfer.files?.[0]);
        }}
        className={`flex cursor-pointer items-center gap-3 py-3 transition-colors duration-300 ${
          isDragging ? "text-forest" : "text-muted hover:text-ink"
        }`}
      >
        <input
          id={`f-${id}`}
          type="file"
          accept={accept}
          hidden
          onChange={(event) => take(event.target.files?.[0])}
        />
        <span aria-hidden className="text-[1.05rem] text-forest">
          ↥
        </span>
        <span className="text-[0.95rem]">
          {file ? file.name : "Drop a file, or click to choose"}
        </span>
        {file && (
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              onFile(null);
            }}
            className="ml-auto cursor-pointer font-mono text-[0.66rem] tracking-[0.12em] text-faint uppercase transition-colors hover:text-error"
          >
            remove
          </button>
        )}
      </label>
      <Rule active={isDragging} />
    </FieldShell>
  );
}

/* ------------------------------------------------------------------ */
/* button                                                              */
/* ------------------------------------------------------------------ */

type ButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "quiet";
  disabled?: boolean;
  type?: "button" | "submit";
};

export function Button({
  children,
  onClick,
  variant = "primary",
  disabled,
  type = "button",
}: ButtonProps) {
  const tone =
    variant === "primary"
      ? "bg-forest text-white shadow-[0_10px_30px_rgba(47,107,61,0.3)] hover:bg-forest-deep hover:-translate-y-0.5 disabled:bg-ink/15 disabled:text-white/70 disabled:shadow-none disabled:translate-y-0"
      : "text-muted hover:text-ink";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`cursor-pointer rounded-full px-8 py-3 font-mono text-[0.72rem] tracking-[0.16em] uppercase transition-[background-color,color,transform,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] disabled:cursor-default ${tone}`}
    >
      {children}
    </button>
  );
}
