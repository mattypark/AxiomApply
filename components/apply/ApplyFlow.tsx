"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  APPLY_STEPS,
  MAX_FILE,
  TEXTAREA_HINT,
  WEBHOOK_URL,
  type ApplyField,
} from "@/lib/apply-contract";
import { GlassInput, GlassSelect, GlassTextarea } from "@/components/glass/GlassInput";
import { GlassButton } from "@/components/glass/GlassButton";
import { Dropzone } from "@/components/apply/Dropzone";

/**
 * The application flow. Same questions, same wire payload, same webhook
 * as the Astro build — see lib/apply-contract.ts for the frozen contract.
 * Submission is a browser-side fire-and-forget POST (mode: "no-cors").
 */

type FormData = Record<string, string>;
type FormFiles = Record<string, File>;

/** Optional signed-in prefill (name/email/school/grade) — payload unchanged. */
export type ApplyPrefill = Partial<
  Pick<FormData, "name" | "email" | "school" | "grade">
>;

function fileToBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res((r.result + "").split(",")[1] || "");
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

export function ApplyFlow({ prefill }: { prefill?: ApplyPrefill }) {
  const reduce = useReducedMotion();
  const stepRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>(() => {
    const seed: FormData = {};
    if (prefill) {
      for (const [k, v] of Object.entries(prefill)) if (v) seed[k] = v;
    }
    return seed;
  });
  const [formFiles, setFormFiles] = useState<FormFiles>({});

  const current = APPLY_STEPS[step];
  const last = step === APPLY_STEPS.length - 1;

  const setValue = (name: string, value: string) =>
    setFormData((d) => ({ ...d, [name]: value }));

  const validate = () => {
    const root = stepRef.current;
    if (!root) return true;
    const controls = root.querySelectorAll<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >("input, select, textarea");
    for (const c of controls) {
      if (!c.checkValidity()) {
        c.reportValidity();
        return false;
      }
    }
    return true;
  };

  const attachFiles = async (payload: FormData) => {
    for (const [name, file] of Object.entries(formFiles)) {
      if (!file || file.size > MAX_FILE) continue;
      payload[`${name}_name`] = file.name;
      payload[`${name}_type`] = file.type || "application/octet-stream";
      payload[`${name}_base64`] = await fileToBase64(file);
    }
    return payload;
  };

  const submit = async () => {
    if (!validate() || submitting) return;
    setSubmitting(true);
    try {
      const payload = await attachFiles({ ...formData });
      // Fire-and-forget: Apps Script response is opaque under no-cors.
      try {
        fetch(WEBHOOK_URL, {
          method: "POST",
          mode: "no-cors",
          body: new URLSearchParams(payload),
        });
      } catch {
        /* opaque by design */
      }
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (f: ApplyField) => {
    const common = {
      id: `apply-${f.name}`,
      name: f.name,
      required: f.required,
      value: formData[f.name] ?? "",
      onChange: (
        e: React.ChangeEvent<
          HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >,
      ) => setValue(f.name, e.target.value),
    };

    if (f.type === "select") {
      return (
        <GlassSelect {...common}>
          <option value="" disabled>
            Select…
          </option>
          {f.options?.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </GlassSelect>
      );
    }
    if (f.type === "textarea") {
      return <GlassTextarea {...common} placeholder={f.placeholder} />;
    }
    if (f.type === "file") {
      return (
        <Dropzone
          field={f}
          file={formFiles[f.name] ?? null}
          onFile={(file) =>
            setFormFiles((prev) => {
              const next = { ...prev };
              if (file) next[f.name] = file;
              else delete next[f.name];
              return next;
            })
          }
        />
      );
    }
    return (
      <GlassInput
        {...common}
        type={f.type}
        placeholder={f.placeholder}
        autoComplete={f.autocomplete}
      />
    );
  };

  if (done) {
    return (
      <motion.div
        initial={reduce ? false : { opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-4 py-10 text-center"
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-forest text-2xl text-white shadow-[0_10px_30px_rgba(47,107,61,0.4)]">
          ✓
        </span>
        <h3 className="text-2xl font-semibold tracking-tight text-ink">
          Application sent.
        </h3>
        <p className="max-w-[40ch] text-[0.95rem] leading-relaxed text-muted">
          We read every one. The first batch goes out late July — early August,
          and <strong className="text-ink">every applicant hears back</strong>.
        </p>
        <p className="mt-2 max-w-[44ch] text-[0.88rem] leading-relaxed text-muted">
          In the meantime — follow along on{" "}
          <a
            className="font-medium text-forest hover:text-forest-deep"
            href="https://www.linkedin.com/company/axiom-pathways"
            target="_blank"
            rel="noopener"
          >
            LinkedIn
          </a>{" "}
          or see{" "}
          <a className="font-medium text-forest hover:text-forest-deep" href="/social">
            all our socials →
          </a>
        </p>
      </motion.div>
    );
  }

  return (
    <div>
      {/* progress dots */}
      <div className="flex items-center gap-2" aria-hidden="true">
        {APPLY_STEPS.map((_, k) => (
          <span
            key={k}
            className={`h-1.5 rounded-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              k <= step ? "w-8 bg-forest" : "w-4 bg-ink/15"
            }`}
          />
        ))}
      </div>

      <p className="mt-4 font-mono text-[0.7rem] tracking-[0.16em] text-muted uppercase">
        {step + 1} of {APPLY_STEPS.length} · {current.title}
      </p>
      {current.sub && (
        <p className="mt-1 text-[0.9rem] text-muted">{current.sub}</p>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          ref={stepRef}
          initial={reduce ? false : { opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduce ? undefined : { opacity: 0, x: -12 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="mt-7 flex flex-col gap-5"
        >
          {current.fields.map((f) => (
            <div key={f.name} className="flex flex-col gap-2">
              {/* Dropzone renders its own <label> wrapper, so file fields
                  get a plain heading instead of a nested label */}
              {f.type === "file" ? (
                <span className="text-[0.88rem] font-medium text-ink">
                  {f.label}
                </span>
              ) : (
                <label
                  htmlFor={`apply-${f.name}`}
                  className="text-[0.88rem] font-medium text-ink"
                >
                  {f.label}
                </label>
              )}
              {f.type === "textarea" && (
                <p className="-mt-1 text-[0.78rem] text-faint">{TEXTAREA_HINT}</p>
              )}
              {renderField(f)}
            </div>
          ))}

          <div className="mt-2 flex items-center justify-between gap-4">
            {step > 0 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="text-[0.9rem] text-muted transition-colors hover:text-ink"
              >
                ← Back
              </button>
            ) : (
              <span />
            )}
            <GlassButton
              tone="forest"
              type="button"
              disabled={submitting}
              onClick={() => {
                if (last) void submit();
                else if (validate()) setStep((s) => s + 1);
              }}
            >
              {last ? (submitting ? "Sending…" : "Submit →") : "Next →"}
            </GlassButton>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
