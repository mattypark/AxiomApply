import Link from "next/link";
import { InView } from "@/components/motion/InView";
import { SectionHead } from "@/components/sections/SectionHead";

/**
 * 03 — how it works.
 *
 * Three columns, because there are three steps and a fourth would be invented.
 * The promise in step two is the one that costs Axiom something — fourteen
 * days, a person reading it — so it is stated plainly rather than softened.
 */

const STEPS = [
  {
    n: "01",
    title: "Apply once",
    body: "One application, links before paragraphs. No portal, no cover letter, no account needed first.",
  },
  {
    n: "02",
    title: "A person reads it",
    body: "Fourteen days, either way. Not a filter and not a keyword scan — someone reads every one.",
  },
  {
    n: "03",
    title: "We make the introduction",
    body: "If it fits, the email names the startup and the role, and goes to the person who decides.",
  },
] as const;

export function HowItWorksSection() {
  return (
    <section className="bg-paper py-28 sm:py-40">
      <SectionHead
        index="03"
        label="how it works"
        title={
          <>
            Write it once.
            <br />
            We take it from there.
          </>
        }
      />

      <div className="mx-auto mt-16 grid w-full max-w-[68rem] gap-10 px-6 sm:grid-cols-3 sm:gap-8">
        {STEPS.map((step, index) => (
          <InView key={step.n} delay={index * 90}>
            <p className="font-mono text-[0.8125rem] tracking-[0.08em] text-forest">
              {step.n}
            </p>
            <h3 className="mt-4 text-[1.25rem] font-medium text-ink">
              {step.title}
            </h3>
            <p className="mt-3 text-[1rem] leading-[1.55] text-muted">
              {step.body}
            </p>
          </InView>
        ))}
      </div>

      <InView
        delay={280}
        className="mx-auto mt-14 flex w-full max-w-[68rem] flex-wrap items-center justify-between gap-6 px-6"
      >
        <p className="max-w-[40ch] text-[1.0625rem] leading-[1.55] text-ink">
          One application, not a hundred forms.{" "}
          <span className="text-muted">
            We do the reaching out, every time a role fits.
          </span>
        </p>
        <Link
          href="/onboarding?side=intern"
          className="ax-shine inline-flex items-center rounded-full bg-ink px-7 py-3.5 text-[0.95rem] font-medium text-white transition-transform duration-300 hover:-translate-y-0.5"
        >
          Start yours
        </Link>
      </InView>
    </section>
  );
}
