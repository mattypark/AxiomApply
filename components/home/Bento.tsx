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
      className={`group relative h-full overflow-hidden rounded-[20px] p-4 transition-transform duration-500 ease-ms hover:-translate-y-1 sm:rounded-[28px] sm:p-10 ${tone}`}
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
      className={`ms-display text-[1.3rem] sm:text-[clamp(2rem,3vw,2.9rem)] ${light ? "text-white" : "text-ms-ink"}`}
    >
      {children}
    </h3>
  );
}

function Caption({ children, light }: { children: ReactNode; light?: boolean }) {
  return (
    <p className={`mt-1.5 text-[12px] leading-snug font-medium sm:mt-3 sm:text-[16px] ${light ? "text-white/70" : "text-ms-body"}`}>
      {children}
    </p>
  );
}

/** A mini application, the one thing you fill in. */
function ApplicationSketch() {
  return (
    <div className="absolute right-[-14%] bottom-[-4%] left-[12%] h-[56%] sm:right-[-8%] sm:left-[14%] sm:h-[58%]">
      <div className="absolute inset-0 translate-x-3 translate-y-3 rotate-[4deg] rounded-[14px] bg-white/45 sm:translate-x-6 sm:translate-y-5 sm:rounded-[22px]" />
      <div className="absolute inset-0 rounded-[14px] bg-white p-3.5 shadow-[0_24px_60px_-24px_rgb(23_25_28_/_0.35)] transition-transform duration-700 ease-ms group-hover:-rotate-1 sm:rounded-[22px] sm:p-7">
        <p className="text-[9px] font-medium text-ms-muted sm:text-[13px]">your application</p>
        {["what have you built?", "where do you want to work?", "anything else?"].map((label, index) => (
          <div key={label} className="mt-2.5 sm:mt-5">
            <p className="text-[9.5px] font-medium text-ms-ink sm:text-[14px]">{label}</p>
            <div className="mt-1 h-1.5 rounded-full bg-ms-mist sm:mt-2 sm:h-2.5" style={{ width: `${86 - index * 18}%` }} />
          </div>
        ))}
        <span className="mt-3.5 inline-flex h-6 items-center rounded-full bg-ms-ink px-3 text-[9.5px] font-medium text-white sm:mt-7 sm:h-10 sm:px-5 sm:text-[14px]">
          Send it
        </span>
      </div>
    </div>
  );
}

/** Four applications, fanned; the top one is marked read. */
function ReadStack() {
  return (
    <div className="absolute right-[8%] bottom-[-16%] h-[52%] w-[62%] sm:right-[6%] sm:bottom-[-18%] sm:h-[78%] sm:w-[46%]">
      {[0, 1, 2, 3].map((index) => (
        <div
          key={index}
          className="absolute inset-0 rounded-[12px] bg-white shadow-[0_18px_40px_-20px_rgb(23_25_28_/_0.35)] transition-transform duration-700 ease-ms sm:rounded-[18px]"
          style={{
            transform: `translate(${index * -14}px, ${index * 10}px) rotate(${(index - 1.5) * 4}deg)`,
            opacity: 1 - index * 0.14,
            zIndex: 4 - index,
          }}
        >
          {index === 0 ? (
            <div className="p-3 sm:p-6">
              <div className="h-1.5 w-1/2 rounded-full bg-ms-mist sm:h-2.5 sm:w-2/3" />
              <div className="mt-2 h-1.5 w-2/5 rounded-full bg-ms-mist sm:mt-3 sm:h-2.5 sm:w-1/2" />
              <div className="mt-2 h-1.5 w-1/2 rounded-full bg-ms-mist sm:mt-3 sm:h-2.5 sm:w-3/5" />
              <span className="absolute top-2.5 right-2.5 grid h-6 w-6 place-items-center rounded-full bg-ms-green text-[11px] text-white sm:top-5 sm:right-5 sm:h-11 sm:w-11 sm:text-[18px] transition-transform duration-500 ease-ms group-hover:scale-110">
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
    <div className="mt-3 flex flex-col gap-1.5 sm:mt-8 sm:gap-3">
      <p className="w-fit max-w-[88%] rounded-[14px] rounded-bl-[4px] bg-white/10 px-2.5 py-1.5 text-[11px] leading-snug text-white/90 sm:max-w-[80%] sm:rounded-[20px] sm:rounded-bl-[6px] sm:px-4 sm:py-3 sm:text-[15px]">
        Someone here fits the role you posted.
      </p>
      <p className="ml-auto w-fit max-w-[88%] rounded-[14px] rounded-br-[4px] bg-ms-green px-2.5 py-1.5 text-[11px] leading-snug text-white sm:max-w-[80%] sm:rounded-[20px] sm:rounded-br-[6px] sm:px-4 sm:py-3 sm:text-[15px] transition-transform duration-500 ease-ms group-hover:-translate-y-1">
        Send them over.
      </p>
    </div>
  );
}

function Roster() {
  return (
    <div className="mt-3 flex flex-wrap gap-1 sm:mt-8 sm:gap-2">
      {startups.map((startup) => (
        <span
          key={startup.name}
          className="inline-flex items-center gap-1 rounded-full bg-white py-0.5 pr-2 pl-0.5 text-[10px] font-medium text-ms-ink shadow-[0_1px_2px_rgb(23_25_28_/_0.06)] sm:gap-2 sm:py-1.5 sm:pr-3.5 sm:pl-1.5 sm:text-[14px]"
        >
          {/* Monograms, not logos: most of the roster has no logo file, and the
              ones that do are wide wordmarks that turn to mush at chip size. */}
          <span className="grid h-4 w-4 place-items-center rounded-full bg-ms-green/15 text-[8px] font-semibold text-ms-green sm:h-6 sm:w-6 sm:text-[11px]">
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
    <section className="bg-ms-mist px-4 py-14 sm:px-[3%] sm:py-32">
      <div className="mx-auto w-full max-w-[100rem]">
        <InView as="h2" className="ms-display px-1 text-[2rem] text-ms-ink sm:px-2 sm:text-[clamp(2.6rem,5.2vw,4.6rem)]">
          Built for students. Thought through.
        </InView>

        {/* Phones: two columns, so seven tiles take four rows, not seven. */}
        <div className="mt-6 grid grid-cols-2 gap-2.5 sm:mt-12 sm:gap-4 lg:grid-cols-12">
          <Tile
            className="row-span-2 min-h-[20rem] sm:min-h-[34rem] lg:col-span-4"
            tone="bg-[linear-gradient(170deg,var(--path-tile-1)_0%,var(--path-tile-2)_100%)]"
          >
            <Title>Apply once.</Title>
            <Caption>One form. Every startup in the network.</Caption>
            <ApplicationSketch />
          </Tile>

          <Tile className="min-h-[9.75rem] sm:min-h-[21rem] lg:col-span-5" tone="bg-[var(--path-tile-3)]" delay={80}>
            <Title>
              A person
              <br />
              reads it.
            </Title>
            <Caption>No filters. No keyword scans.</Caption>
            <ReadStack />
          </Tile>

          <Tile className="min-h-[9.75rem] sm:min-h-[21rem] lg:col-span-3" tone="bg-[#e8e3db]" delay={160}>
            <Title>Free. Always.</Title>
            <Caption>We&apos;re a nonprofit.</Caption>
            <p className="ms-display absolute right-4 bottom-2 text-[3.2rem] text-ms-ink/90 sm:right-8 sm:bottom-4 sm:text-[clamp(5rem,9vw,8.5rem)] transition-transform duration-700 ease-ms group-hover:-translate-y-2">
              $0
            </p>
          </Tile>

          <Tile className="min-h-[11rem] sm:min-h-[21rem] lg:col-span-4" tone="bg-[#1b1d20]" delay={120}>
            <Title light>We make the intro.</Title>
            <Caption light>Straight to the founder who decides.</Caption>
            <IntroThread />
          </Tile>

          <Tile className="min-h-[11rem] sm:min-h-[21rem] lg:col-span-4" tone="bg-[var(--path-tile-4)]" delay={200}>
            <Title>The network.</Title>
            <Caption>{startups.length} startups hiring right now.</Caption>
            <Roster />
          </Tile>

          <Tile className="lg:col-span-6" tone="bg-[var(--path-tile-5)]" delay={80} href="/internships">
            <p className="text-[12px] leading-snug font-medium text-ms-body sm:text-[16px]">Live internships in the feed</p>
            <p className="ms-display mt-3 text-[2.1rem] text-ms-ink sm:mt-6 sm:text-[clamp(4rem,7vw,6.5rem)]">
              <span className="mr-[0.06em]">≈</span><RollingNumber value={internshipCount} bounceEvery={7000} />
            </p>
            <p className="mt-1.5 text-[11px] leading-snug text-ms-body sm:mt-2 sm:text-[15px]">Open to everyone. Pulled daily. No cut. →</p>
          </Tile>

          <Tile className="lg:col-span-6" tone="bg-[#e5e4ee]" delay={160}>
            <p className="text-[12px] leading-snug font-medium text-ms-body sm:text-[16px]">Time to an answer</p>
            <p className="ms-display mt-3 text-[2.1rem] text-ms-ink sm:mt-6 sm:text-[clamp(4rem,7vw,6.5rem)]">
              <span className="mr-[0.06em]">≈</span><RollingNumber value={14} bounceEvery={7000} />
              <span className="ml-1.5 text-[0.4em] tracking-[-0.03em] sm:ml-3">days</span>
            </p>
            <p className="mt-1.5 text-[11px] leading-snug text-ms-body sm:mt-2 sm:text-[15px]">Either way. A person reads every one.</p>
          </Tile>
        </div>
      </div>
    </section>
  );
}
