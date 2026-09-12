import Image from "next/image";
import { InView } from "@/components/motion/InView";
import { workMedia } from "@/lib/media-manifest";

/**
 * 05 — inside the work.
 *
 * The one section that is pictures rather than type: what an internship
 * actually looks like is the hardest thing on this page to say in words, and
 * the easiest to show. Three cards, the middle one forward, the outer two
 * rotated back a degree so the group reads as a stack someone put down rather
 * than as a gallery.
 *
 * Captions sit outside the stack, small and quiet — this section should be
 * looked at before it is read.
 *
 * Sources come from lib/media-manifest.ts so the footage can be replaced
 * without touching this layout. Everything in there is a placeholder today.
 */

const LEAN = ["-rotate-[1.5deg]", "rotate-0", "rotate-[1.5deg]"] as const;
const LIFT = ["lg:mt-10", "lg:-mt-4", "lg:mt-10"] as const;

export function InsideTheWorkSection() {
  return (
    <section className="bg-paper py-28 sm:py-40">
      <div className="mx-auto flex w-full max-w-[68rem] flex-col items-center px-6 text-center">
        <InView className="font-mono text-[0.8125rem] tracking-[0.08em]">
          <span className="text-forest">05</span>{" "}
          <span className="text-faint">/ inside the work</span>
        </InView>

        <InView
          as="h2"
          delay={80}
          className="mt-6 max-w-[18ch] font-display text-[clamp(2.25rem,5.5vw,4.25rem)] leading-[1.04] tracking-[-0.015em] text-ink"
        >
          Not shadowing. Not coffee. The actual work.
        </InView>

        <InView
          as="p"
          delay={160}
          className="mt-5 max-w-[52ch] text-[1.0625rem] leading-[1.55] text-muted"
        >
          Interns in the network ship things that go out — to users, to
          customers, to the founder&apos;s roadmap. This is what that has looked
          like.
        </InView>
      </div>

      <div className="mx-auto mt-16 grid w-full max-w-[68rem] gap-6 px-6 sm:grid-cols-3">
        {workMedia.map((slot, index) => (
          <InView
            key={slot.src}
            delay={index * 110}
            className={`flex flex-col gap-3 ${LIFT[index] ?? ""}`}
          >
            <div
              className={`overflow-hidden rounded-[20px] bg-card shadow-float transition-transform duration-500 ease-story hover:rotate-0 ${
                LEAN[index] ?? ""
              }`}
            >
              {slot.kind === "video" ? (
                <video
                  src={slot.src}
                  poster={slot.poster}
                  aria-label={slot.alt}
                  muted
                  loop
                  playsInline
                  autoPlay
                  className="h-full w-full object-cover"
                />
              ) : (
                <Image
                  src={slot.src}
                  alt={slot.alt}
                  width={400}
                  height={500}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <p className="px-1 font-mono text-[0.7rem] tracking-[0.08em] text-faint uppercase">
              {slot.caption}
            </p>
          </InView>
        ))}
      </div>
    </section>
  );
}
