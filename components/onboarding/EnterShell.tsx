import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Paint } from "@/components/product/model";
import { Product } from "@/components/product/Product";

/**
 * The sign-in frame, in the home page's clothes: Hanken Grotesk on the
 * hero's light green, black pills, and the product rocket standing in the
 * apply block's white arch. Walking in from the home should feel like the
 * next room of the same house, not a different site.
 *
 * The rocket wears the colour of the chosen path (`paint`, else the one
 * the visitor last picked). On a phone the
 * arch shrinks and sits above the words, so the button stays near the fold.
 */
export function EnterShell({ children, paint }: { children: ReactNode; paint?: Paint }) {
  return (
    <div className="ms ms-ground flex min-h-dvh flex-col">
      <header className="mx-auto flex h-20 w-full max-w-[90rem] items-center justify-between px-6 sm:px-[6.5%]">
        <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="Axiom home">
          <Image
            src="/axiom-mark-256.png"
            alt=""
            width={256}
            height={256}
            priority
            className="h-8 w-8 object-contain"
          />
          <span className="text-[22px] font-semibold tracking-[-0.04em] text-ms-ink">axiom</span>
        </Link>
        <Link href="/" className="text-[15px] font-medium text-ms-body transition-opacity hover:opacity-60">
          Back to home
        </Link>
      </header>

      <main className="mx-auto grid w-full max-w-[90rem] flex-1 items-center gap-8 px-6 pb-12 sm:px-[6.5%] lg:grid-cols-[1fr_1fr] lg:gap-20 lg:pb-20">
        <div
          className="relative mx-auto aspect-[0.8] w-full max-w-[13rem] overflow-hidden rounded-t-[999px] rounded-b-[28px] sm:max-w-[16rem] lg:order-last lg:max-w-[30rem] lg:rounded-b-[36px]"
          style={{ background: "linear-gradient(180deg, #ffffff 0%, #f6f8f7 100%)" }}
        >
          <Product className="!absolute inset-0" scale={0.95} turn={1.2} paint={paint} />
        </div>

        <div className="w-full max-w-[32rem] max-lg:mx-auto">{children}</div>
      </main>
    </div>
  );
}
