import Link from "next/link";
import { Product } from "@/components/product/Product";

/**
 * Moonshot's hero, beat for beat: a line of normal size, one
 * enormous word, two short lines of what it does, a black pill and a
 * whispered footnote beside it — and the product filling the right half
 * against a light green ground (Moonshot's is sky blue). The product is the rocket until Axiom has a real one.
 */
export function Hero({ ctaHref }: { ctaHref: string }) {
  return (
    <section
      className="relative isolate min-h-svh overflow-hidden"
      style={{
        background:
          "radial-gradient(45% 55% at 72% 48%, rgb(255 255 255 / 0.65) 0%, transparent 70%), linear-gradient(180deg, #bfe0c9 0%, #cfe8d6 42%, #e8f4ec 100%)",
      }}
    >
      <Product
        className="ms-rise pointer-events-none !absolute top-[8%] right-0 bottom-0 left-[42%] max-lg:top-auto max-lg:left-0 max-lg:h-[46svh]"
        scale={1.05}
      />

      <div className="relative mx-auto flex min-h-svh w-full max-w-[100rem] flex-col justify-center px-6 pt-28 pb-[50svh] sm:px-[6.5%] lg:pb-20">
        <h1>
          <span
            className="ms-rise ms-display block text-[clamp(2.4rem,4.6vw,4.6rem)]"
            style={{ ["--d" as string]: "0ms" }}
          >
            Find your passion at
          </span>
          <span
            className="ms-rise ms-display block text-[clamp(4.8rem,11vw,10.5rem)] tracking-[-0.055em]"
            style={{ ["--d" as string]: "180ms" }}
          >
            Axiom
          </span>
        </h1>

        <p
          className="ms-rise mt-7 max-w-[30ch] text-[clamp(1.1rem,1.5vw,1.35rem)] leading-[1.4] text-ms-body"
          style={{ ["--d" as string]: "280ms" }}
        >
          One application. We put it in front of founders who are actually
          hiring, and make the intro ourselves.
        </p>

        <div
          className="ms-rise mt-9 flex flex-wrap items-center gap-x-8 gap-y-4"
          style={{ ["--d" as string]: "380ms" }}
        >
          <Link href={ctaHref} className="ms-pill">
            Apply — it&apos;s free
          </Link>
          <p className="text-[15px] leading-[1.45] text-ms-body">
            Read by a person.
            <br />
            An answer within 14 days.
          </p>
        </div>
      </div>
    </section>
  );
}
