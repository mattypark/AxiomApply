import Link from "next/link";
import { DotsField } from "@/components/welcome/scroll/DotsField";
import { InView } from "@/components/motion/InView";

/**
 * The dark band between the network and the mechanics.
 *
 * Two different things get called "internships" on this site and the page has
 * to be honest about which is which: the feed is thousands of listings we did
 * not create and take no cut of, the network is the handful we place people
 * into ourselves. This band is the feed, and it is the largest number Axiom
 * can truthfully put on a page.
 *
 * The count arrives from the internships table (see lib/internship-count.ts).
 * It is set as digits in a row so the number reads as an instrument panel
 * rather than as a sentence.
 */

export function CountBanner({ count }: { count: number }) {
  const digits = count.toLocaleString("en-US").split("");

  return (
    <section className="bg-paper px-6">
      <div className="relative mx-auto w-full max-w-[76rem] overflow-hidden rounded-[28px] bg-night py-24 text-night-text sm:py-32">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            maskImage:
              "radial-gradient(70% 60% at 50% 45%, transparent 25%, #000 80%)",
            WebkitMaskImage:
              "radial-gradient(70% 60% at 50% 45%, transparent 25%, #000 80%)",
          }}
        >
          <DotsField />
        </div>

        {/* A forest wash off the bottom edge, so the band is not a flat black
            rectangle sitting in a warm page. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 90% at 50% 118%, rgba(63,143,82,0.42) 0%, transparent 62%)",
          }}
        />

        <div className="relative flex flex-col items-center px-6 text-center">
          <InView className="font-mono text-[0.72rem] tracking-[0.1em] text-night-muted uppercase">
            The feed · refreshed daily
          </InView>

          <InView
            delay={80}
            className="mt-6 flex items-end gap-[0.06em] font-display text-[clamp(3.4rem,12vw,8rem)] leading-[0.9] tracking-[-0.02em]"
          >
            {digits.map((digit, index) => (
              <span
                key={`${digit}-${index}`}
                className={digit === "," ? "text-night-muted" : undefined}
              >
                {digit}
              </span>
            ))}
          </InView>

          <InView
            delay={160}
            className="mt-6 max-w-[34ch] text-[1.0625rem] leading-[1.55] text-night-muted"
          >
            live listings, open to everyone. Pulled from the best trackers and
            lists — they aren&apos;t ours, and there is no gate and no cut.
          </InView>

          <InView delay={240} className="mt-9">
            <Link
              href="/internships"
              className="ax-shine inline-flex items-center rounded-full bg-night-text px-7 py-3.5 text-[0.95rem] font-medium text-night transition-transform duration-300 hover:-translate-y-0.5"
            >
              Open the feed
            </Link>
          </InView>
        </div>
      </div>
    </section>
  );
}
