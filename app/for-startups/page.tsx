import Link from "next/link";
import { InView } from "@/components/motion/InView";
import { SectionHead } from "@/components/sections/SectionHead";
import { startups, startupSteps } from "@/lib/site-data";

export const metadata = {
  title: "For startups",
  description:
    "Hungry builders, dropped into your startup. Tell us what you need and we match by hand.",
};

/**
 * The startup side.
 *
 * Same page grammar as the landing — numbered beats, a mono eyebrow, a display
 * statement — inverted onto night. The two sides of this site meet at the Enter
 * fork, and arriving on a page built from different parts would read as
 * arriving somewhere else.
 *
 * It used to be `fixed inset-0 overflow-y-auto`, which made the page its own
 * scroll container: Lenis had nothing to smooth, the URL bar never collapsed on
 * mobile, and anchor links had nowhere to go. It is a normal document now.
 *
 * The primary action is the application, not the mailto. A founder who wants to
 * write an email still can, but "book a call" as the only door meant the one
 * form that actually collects what we need to match was reachable only from the
 * menu.
 */
export default function ForStartupsPage() {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-night text-night-text">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 50% at 80% -10%, rgba(63,143,82,0.16) 0%, transparent 60%), radial-gradient(60% 45% at 10% 110%, rgba(47,107,61,0.14) 0%, transparent 60%)",
        }}
      />

      <div className="relative">
        <header className="mx-auto flex w-full max-w-[68rem] items-center justify-between gap-4 px-6 py-7">
          <Link
            href="/"
            className="font-mono text-[0.68rem] tracking-[0.14em] text-night-muted uppercase transition-colors duration-300 hover:text-night-text"
          >
            ← Axiom Pathways
          </Link>
          <span className="font-mono text-[0.68rem] tracking-[0.14em] text-night-muted uppercase">
            For startups
          </span>
        </header>

        <section className="mx-auto w-full max-w-[68rem] px-6 pt-16 pb-28 sm:pt-24 sm:pb-36">
          <InView
            as="h1"
            className="max-w-[16ch] font-display text-[clamp(2.6rem,7vw,5.6rem)] leading-[1.0] tracking-[-0.02em] text-night-text"
          >
            Hungry builders, dropped into your startup.
          </InView>

          <InView
            as="p"
            delay={100}
            className="mt-7 max-w-[46ch] text-[1.0625rem] leading-[1.55] text-night-muted"
          >
            Young people picked for what they have built, not for where they go
            to school — matched by hand, one at a time, and free to you. Axiom
            is a nonprofit.
          </InView>

          <InView delay={180} className="mt-10 flex flex-wrap items-center gap-5">
            <Link
              href="/onboarding?side=startup"
              className="ax-shine rounded-full bg-night-text px-8 py-4 text-[1rem] font-medium text-night transition-transform duration-300 hover:-translate-y-0.5"
            >
              Tell us what you need
            </Link>
            <a
              href="mailto:matthew@axiompathways.org?subject=Startup%20intro%20call"
              className="text-[0.95rem] text-night-muted underline underline-offset-4 transition-colors duration-200 hover:text-night-text"
            >
              Or book a 15-minute call
            </a>
          </InView>
        </section>

        <section className="py-24 sm:py-32">
          <SectionHead
            index="01"
            label="how it works"
            tone="night"
            title="Three steps, and one of them is ours"
          />

          <div className="mx-auto mt-14 grid w-full max-w-[68rem] gap-10 px-6 sm:grid-cols-3 sm:gap-8">
            {startupSteps.map((step, index) => (
              <InView key={step.n} delay={index * 90}>
                <p className="font-mono text-[0.8125rem] tracking-[0.08em] text-mint">
                  {step.n}
                </p>
                <h3 className="mt-4 text-[1.25rem] font-medium text-night-text">
                  {step.label}
                </h3>
              </InView>
            ))}
          </div>
        </section>

        <section className="py-24 sm:py-32">
          <SectionHead
            index="02"
            label="the network"
            tone="night"
            title="Who is already here"
            subcopy="Every startup currently taking someone through Axiom. It grows as fast as two people can grow it."
          />

          <div className="mx-auto mt-14 grid w-full max-w-[68rem] gap-3 px-6 sm:grid-cols-2 lg:grid-cols-3">
            {startups.map((startup, index) => (
              <InView
                key={startup.name}
                delay={index * 60}
                className="rounded-[18px] bg-white/[0.04] p-5 transition-colors duration-300 hover:bg-white/[0.07]"
              >
                <p className="flex items-baseline justify-between gap-2">
                  <span className="text-[1.05rem] font-medium text-night-text">
                    {startup.name}
                  </span>
                  {startup.yc ? (
                    <span className="shrink-0 font-mono text-[0.62rem] tracking-[0.08em] text-mint uppercase">
                      {startup.yc}
                    </span>
                  ) : null}
                </p>
                <p className="mt-1.5 font-mono text-[0.66rem] leading-relaxed tracking-[0.04em] text-night-muted">
                  {startup.meta}
                </p>
              </InView>
            ))}
          </div>
        </section>

        <section className="px-6 pb-6">
          <div
            className="relative overflow-hidden rounded-[28px] px-6 py-24 text-center sm:py-32"
            style={{
              background:
                "linear-gradient(168deg, var(--color-forest-deep) 0%, var(--color-forest) 60%, var(--color-forest-bright) 100%)",
            }}
          >
            <InView
              as="h2"
              className="mx-auto max-w-[18ch] font-display text-[clamp(2.2rem,5.5vw,4rem)] leading-[1.04] tracking-[-0.02em] text-white"
            >
              Tell us the role. We will find the person.
            </InView>
            <InView delay={120} className="mt-10">
              <Link
                href="/onboarding?side=startup"
                className="ax-shine inline-flex items-center rounded-full bg-white px-9 py-4 text-[1.05rem] font-medium text-forest-deep shadow-[0_16px_44px_rgba(14,15,13,0.28)] transition-transform duration-300 hover:-translate-y-0.5"
              >
                Start here
              </Link>
            </InView>
          </div>
        </section>

        <footer className="mx-auto flex w-full max-w-[68rem] items-baseline justify-between gap-6 px-6 py-10">
          <span className="font-mono text-[0.68rem] tracking-[0.14em] text-night-muted uppercase">
            matthew@axiompathways.org
          </span>
          <span className="font-mono text-[0.68rem] tracking-[0.14em] text-night-muted uppercase">
            Axiom Pathways
          </span>
        </footer>
      </div>
    </div>
  );
}
