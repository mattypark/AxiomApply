"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { GlassPanel } from "@/components/glass/GlassPanel";
import { GlassInput, GlassTextarea } from "@/components/glass/GlassInput";
import { GlassButton } from "@/components/glass/GlassButton";
import {
  completeInternOnboarding,
  completeStartupOnboarding,
} from "@/lib/actions/profile";
import { SEASONS, FIELDS } from "@/types/database";

type Step = "role" | "intern" | "startup";

/**
 * Post-signup onboarding. Account already exists — this decides the side.
 * Interns: quick prefs, straight in. Startups: longer form, then manual
 * approval before the dashboard unlocks.
 */
export function OnboardingFlow() {
  const reduce = useReducedMotion();
  const [step, setStep] = useState<Step>("role");

  const stepMotion = {
    initial: reduce ? false : { opacity: 0, scale: 0.94, filter: "blur(8px)" },
    animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
    exit: reduce ? undefined : { opacity: 0, scale: 0.96, filter: "blur(6px)" },
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  };

  return (
    <AnimatePresence mode="wait">
      {step === "role" && (
        <motion.div key="role" {...stepMotion} className="w-full">
          <div className="flex flex-col items-center gap-2 text-center">
            <span className="kicker">One last thing</span>
            <h1 className="max-w-[22ch] text-balance text-[clamp(1.7rem,4.5vw,2.5rem)] font-semibold leading-tight tracking-tight text-ink">
              Which side are you on?
            </h1>
            <p className="text-[0.92rem] text-muted">
              Are you hiring, or looking for an internship?
            </p>
          </div>

          <div className="mt-8 grid w-full gap-4 sm:grid-cols-2">
            <GlassPanel
              specular
              role="button"
              tabIndex={0}
              aria-label="I'm looking for an internship"
              onClick={() => setStep("intern")}
              onKeyDown={(e) => e.key === "Enter" && setStep("intern")}
              className="group flex cursor-pointer flex-col gap-10 p-7 transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-[var(--shadow-hover)]"
            >
              <span className="kicker text-forest">Student</span>
              <div>
                <h2 className="text-[1.3rem] font-semibold leading-snug tracking-tight text-ink">
                  I&apos;m looking for an internship.
                </h2>
                <p className="mt-2 text-[0.9rem] leading-relaxed text-muted">
                  Two quick questions and you&apos;re in.
                </p>
              </div>
            </GlassPanel>

            <GlassPanel
              variant="dark"
              specular
              role="button"
              tabIndex={0}
              aria-label="I'm a startup hiring interns"
              onClick={() => setStep("startup")}
              onKeyDown={(e) => e.key === "Enter" && setStep("startup")}
              className="group flex cursor-pointer flex-col gap-10 p-7 transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-[0_18px_60px_rgba(0,0,0,0.45)]"
            >
              <span className="kicker text-mint">Startup</span>
              <div>
                <h2 className="text-[1.3rem] font-semibold leading-snug tracking-tight text-white">
                  I&apos;m hiring interns.
                </h2>
                <p className="mt-2 text-[0.9rem] leading-relaxed text-[rgba(242,240,233,0.78)]">
                  Short form, then we verify every startup by hand.
                </p>
              </div>
            </GlassPanel>
          </div>
        </motion.div>
      )}

      {step === "intern" && (
        <motion.div key="intern" {...stepMotion} className="w-full max-w-lg">
          <GlassPanel variant="deep" className="flex w-full flex-col gap-6 p-8">
            <div className="flex flex-col gap-1.5">
              <span className="kicker">Almost in</span>
              <h1 className="text-2xl font-semibold tracking-tight text-ink">
                What are you looking for?
              </h1>
            </div>

            <form action={completeInternOnboarding} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <span className="text-[0.85rem] font-medium text-ink">Seasons</span>
                <div className="flex flex-wrap gap-2.5">
                  {SEASONS.map((s) => (
                    <label key={s} className="cursor-pointer">
                      <input
                        type="checkbox"
                        name="preferred_seasons"
                        value={s}
                        className="peer sr-only"
                      />
                      <span className="chip inline-block capitalize transition-colors duration-200 peer-checked:bg-forest peer-checked:text-white">
                        {s}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-[0.85rem] font-medium text-ink">Fields</span>
                <div className="flex flex-wrap gap-2.5">
                  {FIELDS.map((f) => (
                    <label key={f} className="cursor-pointer">
                      <input
                        type="checkbox"
                        name="preferred_fields"
                        value={f}
                        className="peer sr-only"
                      />
                      <span className="chip inline-block transition-colors duration-200 peer-checked:bg-forest peer-checked:text-white">
                        {f}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-[0.85rem] font-medium text-ink">
                  In your own words (optional)
                </span>
                <GlassTextarea
                  name="looking_for"
                  placeholder="e.g. AI engineering at an early-stage startup, summer or fall…"
                />
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-[0.85rem] font-medium text-ink">
                  Your links{" "}
                  <span className="font-normal text-muted">
                    (optional — you can add these later in Account)
                  </span>
                </span>
                <div className="grid gap-3 sm:grid-cols-2">
                  <GlassInput name="github" placeholder="GitHub — @username or URL" />
                  <GlassInput name="linkedin" placeholder="LinkedIn URL" />
                </div>
                <GlassInput name="social" placeholder="Instagram, X, portfolio… anything" />
              </div>

              <div className="flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setStep("role")}
                  className="text-[0.9rem] text-muted transition-colors hover:text-ink"
                >
                  ← Back
                </button>
                <GlassButton tone="forest" type="submit">
                  Enter Axiom →
                </GlassButton>
              </div>
            </form>
          </GlassPanel>
        </motion.div>
      )}

      {step === "startup" && (
        <motion.div key="startup" {...stepMotion} className="w-full max-w-lg">
          <GlassPanel variant="deep" className="flex w-full flex-col gap-6 p-8">
            <div className="flex flex-col gap-1.5">
              <span className="kicker">Startup verification</span>
              <h1 className="text-2xl font-semibold tracking-tight text-ink">
                Tell us about your startup.
              </h1>
              <p className="text-[0.88rem] leading-relaxed text-muted">
                We verify every startup by hand before the dashboard unlocks —
                usually same-day.
              </p>
            </div>

            <form action={completeStartupOnboarding} className="flex flex-col gap-3">
              <GlassInput name="company" placeholder="Startup name" required />
              <GlassInput
                name="linkedin"
                type="url"
                placeholder="LinkedIn URL (company or founder)"
                required
              />
              <GlassInput
                name="social"
                required
                placeholder="Social media — X, Instagram, or your site"
              />
              <GlassTextarea
                name="looking_for"
                required
                placeholder="What are you looking for specifically? Role, skills, timeline…"
              />
              <div className="mt-1 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setStep("role")}
                  className="text-[0.9rem] text-muted transition-colors hover:text-ink"
                >
                  ← Back
                </button>
                <GlassButton tone="forest" type="submit">
                  Submit for review →
                </GlassButton>
              </div>
            </form>

            <p className="text-center text-[0.85rem] text-muted">
              Not comfortable sharing this yet?{" "}
              <a
                href="mailto:matthew@axiompathways.org?subject=Demo%20call%20request&body=Hi%20Axiom%20—%20I%27d%20rather%20talk%20first.%20Here%27s%20my%20startup%3A%20"
                className="font-medium text-forest transition-colors hover:text-forest-deep"
              >
                Book a demo call with us instead →
              </a>
            </p>
          </GlassPanel>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
