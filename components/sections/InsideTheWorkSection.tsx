import Image from "next/image";
import { InView } from "@/components/motion/InView";
import { SectionHead } from "@/components/sections/SectionHead";
import { workMedia } from "@/lib/media-manifest";

/**
 * 05 — inside the work.
 *
 * klinn puts student testimonials here, in hairline rows: who on the left,
 * what they said on the right. Axiom has no intern quotes it can print yet and
 * will not invent any, so the rows carry what the work looks like instead —
 * caption on the left, the picture on the right — in exactly the same rhythm.
 * When real quotes exist they take the left column and nothing else moves.
 *
 * Sources come from lib/media-manifest.ts, all placeholders today.
 */
export function InsideTheWorkSection() {
  return (
    <section className="py-24 sm:py-32">
      <SectionHead
        index="05"
        label="inside the work"
        icon="quote"
        title="not shadowing. the actual work."
      />

      <div className="mx-auto mt-12 w-full max-w-[49.5rem] px-6">
        {workMedia.map((slot, index) => (
          <InView
            key={slot.src}
            delay={index * 80}
            className="grid gap-5 border-t border-border-muted py-10 last:border-b sm:grid-cols-[14rem_1fr] sm:gap-10"
          >
            <div>
              <span className="grid h-5 w-5 place-items-center rounded-full bg-accent/10 text-[10px] font-semibold text-accent">
                {index + 1}
              </span>
              <p className="mt-3 text-[14px] leading-[18px] text-loud">
                {slot.caption.toLowerCase()}
              </p>
              <p className="mt-1 text-[11px] text-muted">from inside the network</p>
            </div>

            <div className="overflow-hidden rounded-[14px] bg-white shadow-[0_0_0_1px_var(--color-border-faint)]">
              {slot.kind === "video" ? (
                <video
                  src={slot.src}
                  poster={slot.poster}
                  aria-label={slot.alt}
                  muted
                  loop
                  playsInline
                  autoPlay
                  className="aspect-[16/9] w-full object-cover"
                />
              ) : (
                <Image
                  src={slot.src}
                  alt={slot.alt}
                  width={960}
                  height={540}
                  className="aspect-[16/9] w-full object-cover"
                />
              )}
            </div>
          </InView>
        ))}
      </div>
    </section>
  );
}
