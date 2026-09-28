import Image from "next/image";
import Link from "next/link";
import { InView } from "@/components/motion/InView";
import { IntroToast } from "@/components/sections/IntroToast";
import { SectionHead } from "@/components/sections/SectionHead";
import { startups } from "@/lib/site-data";

/**
 * 04 — the startups, then the statement that closes the argument.
 *
 * klinn's layout: the head and one action on the left, a 3×3 wall of logo
 * tiles on the right. The network has eight startups, so the ninth tile is the
 * way in for a ninth rather than a borrowed logo. A startup with no logo file
 * draws a monogram in the accent green; adding a PNG to /public/logos and
 * naming it in lib/site-data.ts upgrades the tile with no change here.
 */

function Monogram({ name }: { name: string }) {
  // Two initials for multi-word names, one otherwise: "Quarter Life Crisis"
  // reads as QL, "Tally" as T.
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("");

  return (
    <span
      aria-hidden="true"
      className="grid h-11 w-11 place-items-center rounded-[10px] bg-accent/10 font-display text-[20px] text-accent"
    >
      {initials}
    </span>
  );
}

const TILE =
  "flex aspect-[1/1.05] flex-col items-center justify-center gap-3 rounded-[14px] bg-white px-2 shadow-[0_0_0_1px_var(--color-border-faint),0_8px_24px_-12px_rgba(4,36,16,0.1)]";

const POINTS = [
  {
    title: "no queue",
    body: "your application goes to the person who decides, not into an applicant pile.",
  },
  {
    title: "no forms",
    body: "write it once. we do the reaching out, every time a role fits.",
  },
] as const;

export function StartupsSection() {
  return (
    <section data-rocket="startups" className="py-24 sm:py-32">
      <div className="mx-auto grid w-full max-w-[49.5rem] gap-12 px-6 md:grid-cols-[1fr_22rem] md:gap-10">
        <div>
          <SectionHead
            bare
            index="04"
            label="the startups"
            icon="nodes"
            title="who you get in front of"
            subcopy={
              <>
                <span className="text-loud">early teams hiring right now</span> —
                small enough that what you build is visible, and close enough
                that the founder still does the hiring.
              </>
            }
          />
          <InView delay={220} className="mt-7">
            <Link href="/onboarding?side=intern" className="btn-gloss btn-sm">
              enter
            </Link>
          </InView>
          <InView delay={300} className="mt-10">
            <IntroToast names={startups.map((startup) => startup.name)} />
          </InView>
        </div>

        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
          {startups.map((startup, index) => (
            <InView key={startup.name} delay={index * 50} className={TILE}>
              {startup.logo ? (
                <Image
                  src={startup.logo}
                  alt=""
                  width={88}
                  height={88}
                  className="h-11 w-auto max-w-[78%] rounded-[10px] object-contain"
                />
              ) : (
                <Monogram name={startup.name} />
              )}
              <span className="text-center text-[11px] leading-[14px] text-loud">
                {startup.name}
              </span>
            </InView>
          ))}
          <InView delay={startups.length * 50}>
            <Link
              href="/for-startups"
              className={`${TILE} shadow-[0_0_0_1px_var(--color-border-strong)] transition-[transform,box-shadow] duration-200 ease-button hover:-translate-y-0.5 [background:transparent]`}
            >
              <span className="grid h-11 w-11 place-items-center rounded-[10px] border border-dashed border-loud/20 text-[20px] text-muted">
                +
              </span>
              <span className="text-center text-[11px] leading-[14px] text-muted">
                your team?
              </span>
            </Link>
          </InView>
        </div>
      </div>

      <InView
        as="p"
        className="mx-auto mt-24 w-full max-w-[49.5rem] px-6 text-[22px] leading-[28px] font-medium tracking-[-0.3px] text-muted sm:mt-32 sm:text-[28px] sm:leading-[34px]"
      >
        students who join axiom{" "}
        <span className="text-loud">
          meet the person doing the hiring, instead of waiting in a list.
        </span>
      </InView>

      <div className="mx-auto mt-16 grid w-full max-w-[49.5rem] gap-10 px-6 sm:mt-20 sm:grid-cols-2">
        {POINTS.map((point, index) => (
          <InView key={point.title} delay={index * 90}>
            <h3 className="font-display text-title-h3 text-loud">{point.title}</h3>
            <p className="mt-3 max-w-[34ch] text-body-default text-muted">{point.body}</p>
          </InView>
        ))}
      </div>
    </section>
  );
}
