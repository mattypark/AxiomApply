import Link from "next/link";
import { InView } from "@/components/motion/InView";
import { RollingNumber } from "@/components/motion/RollingNumber";

/**
 * The dark band between "what you get" and "how it works", klinn's layout:
 * an inset card as wide as the hero, near-black with the sky's green glowing
 * up from the bottom edge, one sentence with a rolling number, one button.
 *
 * Two different things get called "internships" on this site and the page has
 * to be honest about which is which: the feed is thousands of listings we did
 * not create and take no cut of, the network is the handful we place people
 * into ourselves. This band is the feed — the largest number Axiom can
 * truthfully put on a page — and it comes live from the internships table
 * (lib/internship-count.ts).
 */
export function CountBanner({ count }: { count: number }) {
  return (
    <section className="pt-16 lg:pt-28" style={{ paddingInline: "var(--hero-inset)" }}>
      <div
        className="relative overflow-hidden rounded-[var(--radius-hero)] px-6 py-28 text-center sm:py-40"
        style={{
          background:
            "radial-gradient(60% 70% at 50% 110%, rgb(68 122 83 / 0.75) 0%, rgb(41 83 55 / 0.35) 38%, transparent 72%), linear-gradient(180deg, #000603 0%, #050f0a 100%)",
        }}
      >
        <InView as="p" className="text-[20px] leading-[28px] font-medium tracking-[-0.2px] text-white sm:text-[24px] sm:leading-[32px]">
          <RollingNumber value={count} /> live internships in the feed, open to
          everyone
        </InView>

        <InView delay={140} className="mt-7">
          <Link href="/internships" className="btn-gloss">
            open the feed <span aria-hidden="true">↗</span>
          </Link>
        </InView>
      </div>
    </section>
  );
}
