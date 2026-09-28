import Link from "next/link";
import { InView } from "@/components/motion/InView";
import { SectionHead } from "@/components/sections/SectionHead";

/**
 * 01 — how it works.
 *
 * Three columns, because there are three steps and a fourth would be invented.
 * Step three is the promise that costs Axiom something — a person reading
 * every one, fourteen days either way — so it is stated plainly rather than
 * softened.
 */

const STEPS = [
  {
    n: "01",
    title: "create your account",
    body: "a few seconds with google. no portal, no attachments.",
  },
  {
    n: "02",
    title: "answer once",
    body: "what you have built, what you want to build next, where you want to be. once.",
  },
  {
    n: "03",
    title: "we make the intro",
    body: "a person reads every one. if it fits, it goes straight to the founder who decides.",
  },
] as const;

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="scroll-mt-24 py-24 sm:py-32">
      <SectionHead
        index="01"
        label="how it works"
        icon="loop"
        title={
          <>
            write it once.
            <br />
            we take it from there.
          </>
        }
      />

      <div className="mx-auto mt-14 grid w-full max-w-[49.5rem] gap-8 px-6 sm:grid-cols-3 sm:gap-10">
        {STEPS.map((step, index) => (
          <InView key={step.n} delay={index * 90}>
            <p className="text-[11px] text-accent">{step.n}</p>
            <h3 className="mt-2 text-[17px] leading-[22px] text-loud">{step.title}</h3>
            <p className="mt-2 text-[13px] leading-[18px] text-muted">{step.body}</p>
          </InView>
        ))}
      </div>

      <InView
        delay={280}
        className="mx-auto mt-14 flex w-full max-w-[49.5rem] flex-wrap items-center justify-between gap-6 px-6"
      >
        <p className="max-w-[30ch] text-body-default text-muted">
          one application, not a hundred forms.{" "}
          <span className="text-loud">write it once. we handle the reach.</span>
        </p>
        <Link href="/onboarding?side=intern" className="btn-gloss btn-sm">
          start yours
        </Link>
      </InView>
    </section>
  );
}
