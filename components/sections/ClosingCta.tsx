import Link from "next/link";
import { InView } from "@/components/motion/InView";
import { DISCORD_INVITE_URL } from "@/lib/org";

/**
 * The last thing on the page.
 *
 * A full-bleed forest plane carrying one line and one action. Everything
 * before this has been argument; this is the ask, and it gets a colour the
 * rest of the page never uses so it cannot be scrolled past by accident.
 *
 * The Discord line rides along underneath rather than getting its own band —
 * it is the low-commitment option for someone not ready to apply, and putting
 * it at equal weight would give people a way to feel done without applying.
 */

export function ClosingCta() {
  return (
    <section className="px-6 pb-6">
      <div
        className="relative overflow-hidden rounded-[28px] px-6 py-28 text-center sm:py-36"
        style={{
          background:
            "linear-gradient(168deg, var(--color-forest-deep) 0%, var(--color-forest) 58%, var(--color-forest-bright) 100%)",
        }}
      >
        <InView
          as="h2"
          className="mx-auto max-w-[16ch] font-display text-[clamp(2.4rem,6.5vw,5rem)] leading-[1.02] tracking-[-0.02em] text-white"
        >
          Get in front of the people who decide.
        </InView>

        <InView delay={120} className="mt-10">
          <Link
            href="/onboarding?side=intern"
            className="ax-shine inline-flex items-center rounded-full bg-white px-9 py-4 text-[1.05rem] font-medium text-forest-deep shadow-[0_16px_44px_rgba(14,15,13,0.24)] transition-transform duration-300 hover:-translate-y-0.5"
          >
            Enter
          </Link>
        </InView>

        <InView delay={200} className="mt-8">
          <p className="text-[0.95rem] text-white/70">
            Not ready to apply?{" "}
            <a
              href={DISCORD_INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white underline underline-offset-4 transition-opacity duration-200 hover:opacity-80"
            >
              The Discord
            </a>{" "}
            gets new roles first.
          </p>
        </InView>
      </div>
    </section>
  );
}
