import Link from "next/link";
import type { ReactNode } from "react";
import { InView } from "@/components/motion/InView";
import { RollingNumber } from "@/components/motion/RollingNumber";
import { startups } from "@/lib/site-data";

/**
 * Moonshot's "Little things. Thought through." bento, with Axiom's promises
 * in the tiles. Moonshot fills its tiles with product photography; Axiom has
 * none yet, so each tile carries a small drawn scene instead — a card, a
 * stack, a thread, a roster — built from the same shapes as the rest of the
 * site. Swap any of them for a photo later without touching the grid.
 *
 * Layout mirrors theirs on a 12-column grid: one tall tile on the left, a
 * wide and a narrow tile, two halves, then two number tiles.
 */

function Tile({
  children,
  className = "",
  tone,
  delay = 0,
  href,
}: {
  children: ReactNode;
  className?: string;
  tone: string;
  delay?: number;
  href?: string;
}) {
  const body = (
    <div
      className={`group relative h-full overflow-hidden rounded-[28px] p-8 transition-transform duration-500 ease-ms hover:-translate-y-1 sm:p-10 ${tone}`}
    >
      {children}
    </div>
  );
  return (
    <InView delay={delay} className={className}>
      {href ? (
        <Link href={href} className="block h-full">
          {body}
        </Link>
      ) : (
        body
      )}
    </InView>
  );
}

function Title({ children, light }: { children: ReactNode; light?: boolean }) {
  return (
    <h3
      className={`ms-display text-[clamp(2rem,3vw,2.9rem)] ${light ? "text-white" : "text-ms-ink"}`}
    >
      {children}
    </h3>
  );
}

function Caption({ children, light }: { children: ReactNode; light?: boolean }) {
  return (
    <p className={`mt-3 text-[16px] font-medium ${light ? "text-white/70" : "text-ms-body"}`}>
      {children}
    </p>
  );
}

/** A mini application, the one thing you fill in. */
function ApplicationSketch() {
  return (
    <div className="absolute right-[-8%] bottom-[-4%] left-[14%] h-[58%]">
      <div className="absolute inset-0 translate-x-6 translate-y-5 rotate-[4deg] rounded-[22px] bg-white/45" />
      <div className="absolute inset-0 rounded-[22px] bg-white p-7 shadow-[0_24px_60px_-24px_rgb(23_25_28_/_0.35)] transition-transform duration-700 ease-ms group-hover:-rotate-1">
        <p className="text-[13px] font-medium text-ms-muted">your application</p>
        {["what have you built?", "where do you want to work?", "anything else?"].map((label, index) => (
          <div key={label} className="mt-5">
            <p className="text-[14px] font-medium text-ms-ink">{label}</p>
            <div className="mt-2 h-2.5 rounded-full bg-ms-mist" style={{ width: `${86 - index * 18}%` }} />
          </div>
        ))}
        <span className="mt-7 inline-flex h-10 items-center rounded-full bg-ms-ink px-5 text-[14px] font-medium text-white">
          Send it
        </span>
      </div>
    </div>
  );
}

/** Four applications, fanned; the top one is marked read. */
function ReadStack() {
  return (
    <div className="absolute right-[6%] bottom-[-18%] h-[78%] w-[46%]">
      {[0, 1, 2, 3].map((index) => (
        <div
          key={index}
          className="absolute inset-0 rounded-[18px] bg-white shadow-[0_18px_40px_-20px_rgb(23_25_28_/_0.35)] transition-transform duration-700 ease-ms"
          style={{
            transform: `translate(${index * -14}px, ${index * 10}px) rotate(${(index - 1.5) * 4}deg)`,
            opacity: 1 - index * 0.14,
            zIndex: 4 - index,
          }}
        >
          {index === 0 ? (
            <div className="p-6">
              <div className="h-2.5 w-2/3 rounded-full bg-ms-mist" />
              <div className="mt-3 h-2.5 w-1/2 rounded-full bg-ms-mist" />
              <div className="mt-3 h-2.5 w-3/5 rounded-full bg-ms-mist" />
              <span className="absolute top-5 right-5 grid h-11 w-11 place-items-center rounded-full bg-ms-green text-[18px] text-white transition-transform duration-500 ease-ms group-hover:scale-110">
                ✓
              </span>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

/** The intro, as the two messages it actually is. */
function IntroThread() {
  return (
    <div className="mt-8 flex flex-col gap-3">
      <p className="w-fit max-w-[80%] rounded-[20px] rounded-bl-[6px] bg-white/10 px-4 py-3 text-[15px] text-white/90">
        Someone here fits the role you posted.
      </p>
      <p className="ml-auto w-fit max-w-[80%] rounded-[20px] rounded-br-[6px] bg-ms-green px-4 py-3 text-[15px] text-white transition-transform duration-500 ease-ms group-hover:-translate-y-1">
        Send them over.
      </p>
    </div>
  );
}

function Roster() {
  return (
    <div className="mt-8 flex flex-wrap gap-2">
      {startups.map((startup) => (
        <span
          key={startup.name}
          className="inline-flex items-center gap-2 rounded-full bg-white py-1.5 pr-3.5 pl-1.5 text-[14px] font-medium text-ms-ink shadow-[0_1px_2px_rgb(23_25_28_/_0.06)]"
        >
          {/* Monograms, not logos: most of the roster has no logo file, and the
              ones that do are wide wordmarks that turn to mush at chip size. */}
          <span className="grid h-6 w-6 place-items-center rounded-full bg-ms-green/15 text-[11px] font-semibold text-ms-green">
            {startup.name[0]}
          </span>
          {startup.name}
        </span>
      ))}
    </div>
  );
}

export function Bento({ internshipCount }: { internshipCount: number }) {
  return (
    <section className="bg-ms-mist px-4 py-24 sm:px-[3%] sm:py-32">
      <div className="mx-auto w-full max-w-[100rem]">
        <InView as="h2" className="ms-display px-2 text-[clamp(2.6rem,5.2vw,4.6rem)] text-ms-ink">
          Built for students. Thought through.
        </InView>

        <div className="mt-12 grid gap-4 lg:grid-cols-12">
          <Tile
            className="min-h-[34rem] lg:col-span-4 lg:row-span-2"
            tone="bg-[linear-gradient(170deg,#d3e8d9_0%,#e6efe2_100%)]"
          >
            <Title>Apply once.</Title>
            <Caption>One form. Every startup in the network.</Caption>
            <ApplicationSketch />
          </Tile>

          <Tile className="min-h-[21rem] lg:col-span-5" tone="bg-[#cfe3d5]" delay={80}>
            <Title>
              A person
              <br />
              reads it.
            </Title>
            <Caption>No filters. No keyword scans.</Caption>
            <ReadStack />
          </Tile>

          <Tile className="min-h-[21rem] lg:col-span-3" tone="bg-[#e8e3db]" delay={160}>
            <Title>Free. Always.</Title>
            <Caption>We&apos;re a nonprofit.</Caption>
            <p className="ms-display absolute right-8 bottom-4 text-[clamp(5rem,9vw,8.5rem)] text-ms-ink/90 transition-transform duration-700 ease-ms group-hover:-translate-y-2">
              $0
            </p>
          </Tile>

          <Tile className="min-h-[21rem] lg:col-span-4" tone="bg-[#1b1d20]" delay={120}>
            <Title light>We make the intro.</Title>
            <Caption light>Straight to the founder who decides.</Caption>
            <IntroThread />
          </Tile>

          <Tile className="min-h-[21rem] lg:col-span-4" tone="bg-[#dde7df]" delay={200}>
            <Title>The network.</Title>
            <Caption>{startups.length} startups hiring right now.</Caption>
            <Roster />
          </Tile>

          <Tile className="lg:col-span-6" tone="bg-[#e9edd3]" delay={80} href="/internships">
            <p className="text-[16px] font-medium text-ms-body">Live internships in the feed</p>
            <p className="ms-display mt-6 text-[clamp(4rem,7vw,6.5rem)] text-ms-ink">
              ≈<RollingNumber value={internshipCount} bounceEvery={7000} />
            </p>
            <p className="mt-2 text-[15px] text-ms-body">Open to everyone. Pulled daily. No cut. →</p>
          </Tile>

          <Tile className="lg:col-span-6" tone="bg-[#e5e4ee]" delay={160}>
            <p className="text-[16px] font-medium text-ms-body">Time to an answer</p>
            <p className="ms-display mt-6 text-[clamp(4rem,7vw,6.5rem)] text-ms-ink">
              ≈<RollingNumber value={14} bounceEvery={7000} />
              <span className="ml-3 text-[0.4em] tracking-[-0.03em]">days</span>
            </p>
            <p className="mt-2 text-[15px] text-ms-body">Either way. A person reads every one.</p>
          </Tile>
        </div>
      </div>
    </section>
  );
}
