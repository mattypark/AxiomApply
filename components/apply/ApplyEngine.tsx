"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  isSectionComplete,
  isVisible,
  requiredIds,
  TEXTAREA_HINT,
  type Answers,
  type Question,
  type QuestionSet,
} from "@/lib/apply-sections";
import {
  Button,
  FileField,
  MultiCheckboxField,
  SelectField,
  TextArea,
  TextField,
  YesNoField,
} from "@/components/apply/fields";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { setRole } from "@/lib/actions/profile";
import { notifyAccountCreated } from "@/lib/actions/account";
import { MediaPanel } from "@/components/apply/MediaPanel";
import { Rule, useLineFill } from "@/components/apply/Rule";

/**
 * The application engine. One component renders both question sets — the
 * intern application and the startup application — off the data in
 * lib/apply-sections.ts.
 *
 * Layout is split down the middle: rail, then the form on the LEFT, then the
 * media panel on the right. The form never centres.
 *
 * Answers autosave to localStorage on every keystroke and are keyed by the
 * set's storageKey, so the two applications never share a draft. Returning to
 * the page restores the draft and shows whose it is.
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

type ApplyEngineProps = {
  set: QuestionSet;
  prefill?: ApplyPrefill;
  backHref?: string;
  /** "dark" runs the whole engine on the night surface (startup side). */
  variant?: "light" | "dark";
  /**
   * "full"     — standalone page: own rail, own scroll containers.
   * "embedded" — inside the workspace shell, which already provides the rail
   *              and page scroll. The engine drops both and flows normally.
   */
  chrome?: "full" | "embedded";
  onSubmit: (answers: Answers, files: Record<string, File>) => Promise<SubmitResult>;
};

/**
 * "Fill this out later." Answers already live in localStorage, so skipping
 * loses nothing — this just records the side (when signed in) and heads to
 * the home page. setRole works signed-out too: it simply redirects.
 */
function SkipButton({ role, next }: { role: QuestionSet["key"]; next: string }) {
  return (
    <form action={setRole}>
      <input type="hidden" name="role" value={role} />
      <input type="hidden" name="next" value={next} />
      <button
        type="submit"
        className="cursor-pointer font-mono text-[0.68rem] tracking-[0.14em] text-faint uppercase transition-colors hover:text-ink"
      >
        <strong className="font-bold text-ink underline underline-offset-4">
          Skip
        </strong>{" "}
        for now — fill this out later →
      </button>
    </form>
  );
}

/**
 * Absolute callback URL for Supabase auth.
 *
 * Prefers NEXT_PUBLIC_SITE_URL: Supabase only honours a `redirect_to` that
 * matches its Redirect URLs allowlist, and silently falls back to the
 * dashboard's Site URL otherwise — which is how people ended up on localhost.
 * Pinning the origin keeps the value predictable and easy to allowlist.
 */
function callbackUrl(next: string): string {
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "") ||
    window.location.origin;
  return `${origin}/auth/callback?next=${encodeURIComponent(next)}`;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Local record that this browser submitted an application.
 *
 * The server row is the truth, but it is not always reachable: the mirror can
 * fail, or the applicant may not be signed in at all. Without this, someone
 * who just submitted lands on a home page that says "no application yet" —
 * which is exactly what an applicant reported. Read alongside the server
 * status, never instead of it.
 */
export const submittedKey = (setKey: string) => `axiom_submitted_${setKey}`;

export function ApplyEngine({
  set,
  prefill,
  backHref = "/",
  variant = "light",
  chrome = "full",
  onSubmit,
}: ApplyEngineProps) {
  const isEmbedded = chrome === "embedded";
  const router = useRouter();
  const columnRef = useRef<HTMLDivElement>(null);

  const [answers, setAnswers] = useState<Answers>({});
  const [files, setFiles] = useState<Record<string, File>>({});
  const [hasStarted, setHasStarted] = useState(false);
  const [gateError, setGateError] = useState("");
  const [invalid, setInvalid] = useState<Set<string>>(new Set());
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resumedFor, setResumedFor] = useState("");
  const [activeSection, setActiveSection] = useState(set.sections[0].id);

  const { nameId, emailId } = set.gate;

  // Restore the draft. Prefill from the signed-in account only fills blanks —
  // a saved draft always wins over the account's stored values.
  useEffect(() => {
    let restored: Answers = {};
    try {
      const raw = localStorage.getItem(set.storageKey);
      if (raw) restored = JSON.parse(raw) as Answers;
    } catch {
      // Malformed draft — start clean rather than trapping the applicant.
    }

    const seeded: Answers = { ...restored };
    // Supabase profiles default display_name to the email address — an email
    // is never a person's name, so it must not land in the name field.
    if (
      prefill?.name &&
      !seeded[nameId] &&
      !EMAIL_PATTERN.test(prefill.name.trim())
    ) {
      seeded[nameId] = prefill.name;
    }
    if (prefill?.email && !seeded[emailId]) seeded[emailId] = prefill.email;

    setAnswers(seeded);

    // A live session IS the gate: signed-in applicants never see it again,
    // even if their profile has no display name yet.
    if (prefill?.isSignedIn && EMAIL_PATTERN.test(seeded[emailId] ?? "")) {
      setResumedFor(seeded[emailId]);
      setHasStarted(true);
      return;
    }

    // Otherwise a completed draft also counts — no second Start press.
    if (seeded[nameId]?.trim() && EMAIL_PATTERN.test(seeded[emailId] ?? "")) {
      setResumedFor(seeded[emailId]);
      setHasStarted(true);
    }
    // Restoring is a mount-time concern; the set never changes for a mounted page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setAnswer = useCallback(
    (id: string, value: string) => {
      setAnswers((previous) => {
        const next = { ...previous, [id]: value };
        try {
          localStorage.setItem(set.storageKey, JSON.stringify(next));
        } catch {
          // Private mode / quota — the form still works, it just cannot resume.
        }
        return next;
      });

      setInvalid((previous) => {
        if (!previous.has(id)) return previous;
        const next = new Set(previous);
        next.delete(id);
        return next;
      });
    },
    [set.storageKey],
  );

  /** Last section unlocked — everything past it is blurred until it fills in. */
  const unlockedThrough = useMemo(() => {
    let index = 0;
    while (
      index < set.sections.length - 1 &&
      isSectionComplete(set.sections[index], answers)
    ) {
      index += 1;
    }
    return index;
  }, [answers, set.sections]);

  // Rail follows the section in view.
  useEffect(() => {
    if (!hasStarted) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
          )[0];
        if (visible) setActiveSection(visible.target.id);
      },
      { rootMargin: "-12% 0px -68% 0px" },
    );

    for (const section of set.sections) {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    }

    return () => observer.disconnect();
  }, [hasStarted, set.sections]);

  // Fill the rules once the sections are actually on the page.
  useLineFill(columnRef, [hasStarted, isSubmitted, unlockedThrough]);

  async function handleStart(password?: string) {
    if (!answers[nameId]?.trim()) {
      setGateError("Your name, first.");
      return;
    }
    const email = answers[emailId]?.trim() ?? "";
    if (!EMAIL_PATTERN.test(email)) {
      setGateError("That email does not look right.");
      return;
    }

    // Email path creates the account here — Google users never see the
    // password field because OAuth already authenticated them. Keyless
    // installs (no Supabase env) skip auth entirely and just unlock.
    const supabase = getBrowserSupabase();
    if (supabase && password !== undefined) {
      if (password.length < 6) {
        setGateError("Password needs at least 6 characters.");
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: callbackUrl(
            `${window.location.pathname}?side=${set.key}`,
          ),
        },
      });

      if (error) {
        // Returning applicant — the address already has an account, so this
        // is a sign-in, not a sign-up.
        if (error.message.toLowerCase().includes("already registered")) {
          const signIn = await supabase.auth.signInWithPassword({ email, password });
          if (signIn.error) {
            setGateError("That email already has an account, and this password does not match it.");
            return;
          }
        } else {
          setGateError("Could not create the account — check the email and try again.");
          return;
        }
      } else {
        // New account — say hello. Never blocks the applicant.
        void notifyAccountCreated(email, answers[nameId]).catch(() => undefined);
      }

      if (!error && !data.session) {
        // "Confirm email" is on in Supabase: the account exists but is not
        // signed in yet. The application still works — answers keep saving
        // locally and the confirmation link lands back here.
        setGateError("");
      }
    }

    setGateError("");
    setResumedFor(email);
    setHasStarted(true);
  }

  function handleReview() {
    const missing = set.sections
      .flatMap((section) => requiredIds(section, answers))
      .filter((id) => !answers[id]?.trim());

    if (missing.length > 0) {
      setInvalid(new Set(missing));
      document
        .getElementById(missing[0])
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setInvalid(new Set());
    setSubmitError("");
    setIsConfirming(true);
  }

  async function handleSubmit() {
    setIsSending(true);
    setSubmitError("");

    const result = await onSubmit(answers, files);

    setIsSending(false);
    if (!result.ok) {
      setSubmitError(result.error ?? "That did not send. Try once more.");
      return;
    }

    try {
      localStorage.removeItem(set.storageKey);
      localStorage.setItem(
        submittedKey(set.key),
        JSON.stringify({
          at: new Date().toISOString(),
          email: answers[emailId] ?? "",
        }),
      );
    } catch {
      // Nothing to clean up if storage was unavailable in the first place.
    }
    setIsConfirming(false);
    setIsSubmitted(true);

    // Hand off to the workspace. The confirmation screen holds long enough to
    // be read, then the applicant lands somewhere they can actually do
    // something — with their status showing — rather than on a dead end.
    const home = set.key === "startup" ? "/startup/home" : "/home";
    window.setTimeout(() => router.push(home), 2600);
  }

  if (isSubmitted) {
    return (
      <div className={`apply-${variant}`}>
        <Submitted
          name={answers[nameId] ?? ""}
          homeHref={set.key === "startup" ? "/startup/home" : "/home"}
        />
      </div>
    );
  }

  return (
    // Standalone: h-dvh + overflow-hidden so the form column and the media
    // panel are separate scroll containers. Embedded: the workspace shell owns
    // scrolling, so the engine flows with the page instead.
    <div
      className={`apply-${variant} flex w-full ${
        isEmbedded ? "" : "h-dvh overflow-hidden"
      }`}
    >
      {!isEmbedded && (
        <Rail
          set={set}
          active={activeSection}
          unlockedThrough={hasStarted ? unlockedThrough : -1}
          backHref={backHref}
        />
      )}

      <div
        className={`flex min-h-0 min-w-0 flex-1 justify-between ${
          isEmbedded ? "" : "h-dvh"
        }`}
      >
        <div
          ref={columnRef}
          // Lenis owns the wheel at document level and scrolls the window with
          // it; without this opt-out the nested column never receives a wheel
          // event and reads as "scroll is broken".
          data-lenis-prevent={isEmbedded ? undefined : ""}
          className={`min-w-0 flex-1 ${
            isEmbedded
              ? "pb-16"
              : "h-dvh overflow-y-auto overscroll-contain px-5 py-12 sm:px-10 lg:px-14"
          }`}
        >
          <header>
            <h1 className="text-[clamp(2rem,4.4vw,3rem)] font-semibold leading-[1.05] tracking-tight text-ink">
              {set.heading}
            </h1>
            <p className="mt-3 font-mono text-[0.68rem] tracking-[0.16em] text-faint uppercase">
              {set.dates}
            </p>
            <div className="mt-6">
              <Rule variant="divider" />
            </div>
            <p className="mt-6 max-w-[58ch] text-[0.95rem] leading-relaxed text-muted">
              {set.note}
            </p>

            <div className="mt-6">
              <SkipButton
                role={set.key}
                next={set.key === "startup" ? "/startup/home" : "/home"}
              />
            </div>

            {hasStarted ? (
              resumedFor && (
                <p className="mt-8 text-[0.88rem] text-muted">
                  Picked up where you left off for{" "}
                  <span className="font-medium text-ink">{resumedFor}</span>.
                  Everything saves as you type.
                </p>
              )
            ) : (
              <Gate
                set={set}
                answers={answers}
                error={gateError}
                isSignedIn={Boolean(prefill?.isSignedIn)}
                setAnswer={setAnswer}
                onStart={(password) => void handleStart(password)}
              />
            )}
          </header>

          {set.sections.map((section, index) => {
            const isLocked = !hasStarted || index > unlockedThrough;

            return (
              <section
                key={section.id}
                id={section.id}
                aria-hidden={isLocked}
                className={`scroll-mt-14 transition-[filter,opacity] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isLocked
                    ? "pointer-events-none select-none opacity-45 blur-[3px]"
                    : ""
                }`}
              >
                <div className="my-14">
                  <Rule variant="divider" />
                </div>

                <p className="font-mono text-[0.66rem] tracking-[0.2em] text-faint uppercase">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h2 className="mt-3 text-[1.6rem] font-semibold tracking-tight text-ink">
                  {section.title}
                </h2>
                {section.blurb && (
                  <p className="mt-2 max-w-[54ch] text-[0.92rem] leading-relaxed text-muted">
                    {section.blurb}
                  </p>
                )}

                <div className="mt-10 flex flex-col gap-9">
                  {section.questions
                    .filter((question) => isVisible(question, answers))
                    .map((question) => (
                      <QuestionField
                        key={question.id}
                        question={question}
                        setKey={set.key}
                        value={answers[question.id] ?? ""}
                        file={files[question.id] ?? null}
                        error={
                          invalid.has(question.id)
                            ? "This one is required"
                            : undefined
                        }
                        setAnswer={setAnswer}
                        setFile={(file) =>
                          setFiles((previous) => {
                            const next = { ...previous };
                            if (file) next[question.id] = file;
                            else delete next[question.id];
                            return next;
                          })
                        }
                      />
                    ))}
                </div>
              </section>
            );
          })}

          {hasStarted && (
            <div className="mt-20 mb-28">
              <Rule variant="divider" />
              {invalid.size > 0 && (
                <p className="mt-6 font-mono text-[0.68rem] tracking-[0.1em] text-error uppercase">
                  {invalid.size} required{" "}
                  {invalid.size === 1 ? "answer" : "answers"} still open
                </p>
              )}
              <div className="mt-8 flex items-center gap-6">
                <Button onClick={handleReview}>Review and submit</Button>
                <span className="text-[0.82rem] text-faint">
                  You can close this and come back — nothing is lost.
                </span>
              </div>
            </div>
          )}
        </div>

        <MediaPanel variant={set.key} embedded={isEmbedded} />
      </div>

      {isConfirming && (
        <ConfirmDialog
          isSending={isSending}
          error={submitError}
          onCancel={() => setIsConfirming(false)}
          onConfirm={handleSubmit}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* rail                                                                */
/* ------------------------------------------------------------------ */

function Rail({
  set,
  active,
  unlockedThrough,
  backHref,
}: {
  set: QuestionSet;
  active: string;
  unlockedThrough: number;
  backHref: string;
}) {
  return (
    <aside className="sticky top-0 hidden h-dvh w-[236px] shrink-0 flex-col px-8 py-12 md:flex">
      <div>
        {/* An explicit way out — people back out of applications to look
            around, and browser-back does not always land anywhere useful. */}
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-mono text-[0.68rem] tracking-[0.14em] text-ink uppercase shadow-[inset_0_0_0_1px_var(--ap-line)] transition-[box-shadow,color] duration-300 hover:text-forest hover:shadow-[inset_0_0_0_1px_var(--ap-line-strong)]"
        >
          ← Back to site
        </Link>

        <nav className="mt-10 flex flex-col gap-3.5">
          {set.sections.map((section, index) => {
            const isActive = active === section.id;
            const isLocked = index > unlockedThrough;

            return (
              <a
                key={section.id}
                href={`#${section.id}`}
                className={`flex items-center gap-2.5 text-[0.88rem] transition-[color,opacity,filter] duration-500 ${
                  isActive ? "font-medium text-ink" : "text-muted hover:text-ink"
                } ${isLocked ? "pointer-events-none select-none opacity-40 blur-[2px]" : ""}`}
              >
                <span
                  aria-hidden
                  className={`w-2 shrink-0 text-center text-[0.7rem] leading-none ${
                    isActive ? "text-forest" : "text-faint"
                  }`}
                >
                  {isActive ? "●" : "›"}
                </span>
                {section.nav}
              </a>
            );
          })}
        </nav>
      </div>

    </aside>
  );
}

/* ------------------------------------------------------------------ */
/* gate                                                                */
/* ------------------------------------------------------------------ */

function Gate({
  set,
  answers,
  error,
  isSignedIn,
  setAnswer,
  onStart,
}: {
  set: QuestionSet;
  answers: Answers;
  error: string;
  isSignedIn: boolean;
  setAnswer: (id: string, value: string) => void;
  onStart: (password?: string) => void;
}) {
  const { nameId, emailId } = set.gate;
  // Never stored in answers/localStorage — passwords are not draft data.
  const [password, setPassword] = useState("");
  // Google users are already authenticated: no password, no second account.
  const needsPassword = Boolean(getBrowserSupabase()) && !isSignedIn;

  return (
    <div className="mt-12">
      <p className="text-[0.95rem] font-medium text-ink">
        Name and email to start.
      </p>
      <p className="mt-1.5 max-w-[46ch] text-[0.88rem] leading-relaxed text-muted">
        {isSignedIn
          ? `Signed in as ${answers[emailId] ?? "your account"}. Your answers save as you type, so you can leave and come back.`
          : "Your answers save to this browser as you type, so you can leave and come back to finish."}
      </p>

      <div className="mt-8 flex flex-col gap-7 sm:max-w-[440px]">
        <TextField
          id={nameId}
          label="Full name"
          value={answers[nameId] ?? ""}
          onChange={(next) => setAnswer(nameId, next)}
          autoComplete="name"
          required
        />
        <TextField
          id={emailId}
          label="Email"
          type="email"
          value={answers[emailId] ?? ""}
          onChange={(next) => setAnswer(emailId, next)}
          autoComplete="email"
          required
        />
        {needsPassword && (
          <TextField
            id="gate-password"
            label="Password"
            type="password"
            helpText="Creates your account. Signing in with Google instead? No password needed."
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            required
          />
        )}
      </div>

      {error && (
        <p className="mt-4 font-mono text-[0.68rem] tracking-[0.1em] text-error uppercase">
          {error}
        </p>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Button onClick={() => onStart(needsPassword ? password : undefined)}>
          Start
        </Button>
        {!isSignedIn && <GoogleButton side={set.key} />}
      </div>
    </div>
  );
}

/**
 * "Continue with Google" inside the gate — this is where the Supabase account
 * gets created. OAuth returns to this same application (side preserved in the
 * query string) with name/email prefilled from the account. Hidden entirely
 * when Supabase env is absent, so the gate still works keyless.
 */
function GoogleButton({ side }: { side: QuestionSet["key"] }) {
  const supabase = getBrowserSupabase();
  if (!supabase) return null;

  const signIn = async () => {
    const next = `${window.location.pathname}?side=${side}`;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl(next),
      },
    });
  };

  return (
    <button
      type="button"
      onClick={() => void signIn()}
      className="inline-flex cursor-pointer items-center gap-2.5 rounded-full px-6 py-3 font-mono text-[0.72rem] tracking-[0.16em] text-ink uppercase shadow-[inset_0_0_0_1px_var(--ap-line)] transition-[box-shadow,color] duration-300 hover:text-forest hover:shadow-[inset_0_0_0_1px_var(--ap-line-strong)]"
    >
      <svg width="15" height="15" viewBox="0 0 48 48" aria-hidden="true">
        <path
          fill="currentColor"
          d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"
        />
      </svg>
      Continue with Google
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* one question                                                        */
/* ------------------------------------------------------------------ */

function QuestionField({
  question,
  setKey,
  value,
  file,
  error,
  setAnswer,
  setFile,
}: {
  question: Question;
  setKey: QuestionSet["key"];
  value: string;
  file: File | null;
  error?: string;
  setAnswer: (id: string, value: string) => void;
  setFile: (file: File | null) => void;
}) {
  const shared = {
    id: question.id,
    label: question.label,
    required: question.required,
    helpText: question.helpText,
    error,
  };

  switch (question.type) {
    case "textarea":
      return (
        <TextArea
          {...shared}
          // The Sheet-era nudge only belongs on the intern application.
          helpText={
            question.helpText ?? (setKey === "intern" ? TEXTAREA_HINT : undefined)
          }
          value={value}
          maxLength={question.maxLength}
          placeholder={question.placeholder}
          onChange={(next) => setAnswer(question.id, next)}
        />
      );

    case "select":
      return (
        <SelectField
          {...shared}
          options={question.options ?? []}
          value={value}
          onChange={(next) => setAnswer(question.id, next)}
        />
      );

    case "yes_no":
      return (
        <YesNoField
          {...shared}
          value={value}
          onChange={(next) => setAnswer(question.id, next)}
        />
      );

    case "multi_checkbox":
      return (
        <MultiCheckboxField
          {...shared}
          options={question.options ?? []}
          values={value ? value.split(",") : []}
          onChange={(next) => setAnswer(question.id, next.join(","))}
        />
      );

    case "file":
      return (
        <FileField
          id={question.id}
          label={question.label}
          helpText={question.helpText}
          accept={question.accept}
          file={file}
          onFile={setFile}
        />
      );

    case "url":
      return (
        <TextField
          {...shared}
          type="url"
          value={value}
          placeholder={question.placeholder}
          onChange={(next) => setAnswer(question.id, next)}
        />
      );

    default:
      return (
        <TextField
          {...shared}
          type={question.inputType ?? "text"}
          value={value}
          maxLength={question.maxLength}
          placeholder={question.placeholder}
          autoComplete={question.autocomplete}
          onChange={(next) => setAnswer(question.id, next)}
        />
      );
  }
}

/* ------------------------------------------------------------------ */
/* confirm + done                                                      */
/* ------------------------------------------------------------------ */

function ConfirmDialog({
  isSending,
  error,
  onCancel,
  onConfirm,
}: {
  isSending: boolean;
  error: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Confirm submission"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--ap-overlay)] px-6 backdrop-blur-sm"
    >
      <div className="w-full max-w-md rounded-[26px] bg-[var(--ap-surface)] p-9 shadow-[var(--shadow-hover)]">
        <p className="text-[1.25rem] font-semibold leading-snug tracking-tight text-ink">
          Ready to send it?
        </p>
        <p className="mt-2 text-[0.9rem] leading-relaxed text-muted">
          A person reads this — not a filter. You will hear back either way.
        </p>

        {error && (
          <p className="mt-5 font-mono text-[0.68rem] tracking-[0.1em] text-error uppercase">
            {error}
          </p>
        )}

        <div className="mt-8 flex items-center gap-4">
          <Button onClick={onConfirm} disabled={isSending}>
            {isSending ? "Sending…" : "Submit"}
          </Button>
          <Button variant="quiet" onClick={onCancel} disabled={isSending}>
            Not yet
          </Button>
        </div>
      </div>
    </div>
  );
}

function Submitted({
  name,
  homeHref,
}: {
  name: string;
  homeHref: string;
}) {
  const firstName = name.trim().split(/\s+/)[0];

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col justify-center px-6 py-16">
      <p className="font-mono text-[0.66rem] tracking-[0.2em] text-faint uppercase">
        received
      </p>
      <h1 className="mt-4 text-[clamp(2rem,5vw,3rem)] font-semibold leading-[1.05] tracking-tight text-ink">
        Got it{firstName ? `, ${firstName}` : ""}.
      </h1>
      <div className="mt-8">
        <Rule variant="divider" />
      </div>
      <p className="mt-8 max-w-[52ch] text-[0.98rem] leading-relaxed text-muted">
        A person reads it — not a filter, not a keyword scan. You hear back
        within 14 days either way. If we match you, the next email names the
        startup and the role.
      </p>
      <p className="mt-4 max-w-[52ch] text-[0.98rem] leading-relaxed text-muted">
        If something changes before then — you shipped something, a project went
        live — reply to the confirmation email and it gets attached to your file.
        Do not submit a second application; duplicates slow your own review down.
      </p>
      <div className="mt-10 flex flex-wrap items-center gap-5">
        <Link
          href={homeHref}
          className="rounded-full bg-forest px-7 py-3.5 font-mono text-[0.72rem] tracking-[0.16em] text-white uppercase shadow-[0_10px_30px_rgba(47,107,61,0.3)] transition-transform duration-300 hover:-translate-y-0.5"
        >
          Go to your home →
        </Link>
        <span className="font-mono text-[0.68rem] tracking-[0.14em] text-faint uppercase">
          Taking you there…
        </span>
      </div>
    </main>
  );
}
