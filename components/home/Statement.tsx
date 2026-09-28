import { InView } from "@/components/motion/InView";

/**
 * Moonshot's "Say it. / See what happens." beat: two short lines at poster
 * size, the second one dropped and indented, and nothing else but one line of
 * small print. It is the whole promise in six words.
 */
export function Statement() {
  return (
    <section id="how" className="scroll-mt-24 bg-white px-6 py-28 sm:px-[6.5%] sm:py-40">
      <div className="mx-auto w-full max-w-[100rem]">
        <h2 className="ms-display text-[clamp(3.2rem,8.2vw,7.2rem)] text-ms-ink">
          <InView as="span" className="block">
            Apply once.
          </InView>
          <InView as="span" delay={140} className="block pl-[12%] text-ms-green">
            We take it from there.
          </InView>
        </h2>
        <InView
          as="p"
          delay={260}
          className="mt-10 max-w-[34ch] pl-[12%] text-[clamp(1.1rem,1.5vw,1.3rem)] leading-[1.45] text-ms-body"
        >
          No portal, no cover letter, no queue. A person reads it, and if it
          fits, the founder hears about you from us.
        </InView>
      </div>
    </section>
  );
}
