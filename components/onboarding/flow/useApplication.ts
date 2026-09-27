"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Question, QuestionSet, Section } from "@/lib/apply-sections";

/**
 * Everything an application screen needs that is not how it looks: answers
 * and files, the draft that survives a reload, the prefill from a signed-in
 * session, validation, the spam trap, and the submit call.
 *
 * Lifted out of ApplyStepper so the question flow and the stepper share one
 * implementation of the parts that touch the wire. Nothing here changes the
 * payload — ids come from lib/apply-sections.ts, which derives the intern set
 * from the frozen contract and throws at load if a name drifts.
 */

export type Answers = Record<string, string>;
export type Files = Record<string, File>;

export type ApplyPrefill = {
  name?: string;
  email?: string;
  /** True when a Supabase session already exists. */
  isSignedIn?: boolean;
};

export type SubmitResult = {
  ok: boolean;
  error?: string;
};

export type FlatQuestion = {
  question: Question;
  section: Section;
  sectionIndex: number;
};

/**
 * Local record that this browser submitted an application. The server row is
 * the truth but is not always reachable — the mirror can fail, and the
 * applicant may never have signed in. Read alongside the server status, never
 * instead of it.
 */
export const submittedKey = (setKey: string) => `axiom_submitted_${setKey}`;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** A multi_checkbox answer is one comma-joined string on the wire. */
export const splitValues = (value: string | undefined) =>
  value ? value.split(", ").filter(Boolean) : [];

export const joinValues = (values: string[]) => values.join(", ");

export function isVisible(question: Question, answers: Answers): boolean {
  const rule = question.conditional;
  if (!rule) return true;

  const parent = answers[rule.dependsOn] ?? "";
  if (rule.showWhen !== undefined) return parent === rule.showWhen;
  if (rule.showWhenOneOf) return rule.showWhenOneOf.includes(parent);
  if (rule.showWhenIncludes) return splitValues(parent).includes(rule.showWhenIncludes);
  return true;
}

export function validate(question: Question, answers: Answers, files: Files) {
  const value = (answers[question.id] ?? "").trim();

  if (question.type === "file") {
    // No set requires a file today, and a missing optional file must never
    // block the step.
    return question.required && !files[question.id] ? "add a file to continue." : null;
  }

  if (question.required && !value) return "this one is required.";
  if (question.inputType === "email" && value && !EMAIL_PATTERN.test(value)) {
    return "that email does not look right.";
  }
  return null;
}

export function useApplication({
  set,
  prefill,
  onSubmit,
}: {
  set: QuestionSet;
  prefill?: ApplyPrefill;
  onSubmit: (answers: Answers, files: Files) => Promise<SubmitResult>;
}) {
  const [answers, setAnswers] = useState<Answers>({});
  const [files, setFiles] = useState<Files>({});
  const [restored, setRestored] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  /**
   * Spam trap: a field no person can see or tab to, and a clock. Both live
   * outside `answers` so nothing here is ever sent. A bot that fills every
   * input, or submits the whole thing in under three seconds, gets the success
   * screen and no POST — telling a scraper it failed just teaches it to retry.
   */
  const trapRef = useRef("");
  const startedAt = useRef(Date.now());

  // Flattened on every answer change: a conditional question appears and
  // disappears as its parent is answered, and the step count has to follow.
  const questions = useMemo(() => {
    const flat: FlatQuestion[] = [];
    set.sections.forEach((section, sectionIndex) => {
      for (const question of section.questions) {
        if (isVisible(question, answers)) flat.push({ question, section, sectionIndex });
      }
    });
    return flat;
  }, [set, answers]);

  // Draft restore. Files cannot survive a reload, so only answers persist.
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
      ...Object.fromEntries(Object.entries(current).filter(([, value]) => value)),
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

  const setAnswer = useCallback((id: string, value: string) => {
    setAnswers((previous) => ({ ...previous, [id]: value }));
  }, []);

  const setFile = useCallback((id: string, file: File | null) => {
    setFiles((previous) => {
      const next = { ...previous };
      if (file) next[id] = file;
      else delete next[id];
      return next;
    });
  }, []);

  /** Fill a blank answer without ever clobbering one the applicant typed. */
  const suggest = useCallback((id: string, value: string) => {
    setAnswers((previous) => (previous[id]?.trim() ? previous : { ...previous, [id]: value }));
  }, []);

  const submit = useCallback(async () => {
    setSubmitting(true);
    setSubmitError(null);

    const looksAutomated =
      trapRef.current.trim() !== "" || Date.now() - startedAt.current < 3000;

    if (looksAutomated) {
      setSubmitted(true);
      setSubmitting(false);
      return;
    }

    const result = await onSubmit(answers, files);

    if (!result.ok) {
      setSubmitError(result.error ?? "that did not send. try once more.");
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
  }, [answers, files, onSubmit, set.key, set.storageKey]);

  return {
    answers,
    files,
    questions,
    restored,
    setAnswer,
    setFile,
    suggest,
    submit,
    submitting,
    submitted,
    submitError,
    trapRef,
  };
}
