import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { RocketGlyph } from "@/components/RocketGlyph";

/**
 * The page for when something didn't launch: a 404, a sign-in that didn't
 * finish. The welcome page's ground and type, the flat rocket parked on the
 * pad with its engine off, one sentence, and a way forward.
 *
 * The rocket idles (a slow float, `.rocket-idle` in globals.css); under
 * reduced motion it simply stands still.
 */
export function RocketMessage({
  kicker,
  title,
  children,
  primary,
  secondary,
}: {
  kicker: string;
  title: string;
  children: ReactNode;
  primary: { href: string; label: string };
  secondary?: { href: string; label: string };
}) {
  return (
    <div className="ms ms-ground flex min-h-dvh flex-col">
      <header className="mx-auto flex h-16 w-full max-w-[90rem] items-center px-4 sm:h-20 sm:px-[6.5%]">
        <Link href="/" className="flex items-center gap-2" aria-label="Axiom home">
          <Image src="/axiom-mark-256.png" alt="" width={256} height={256} className="h-8 w-8 object-contain" />
          <span className="text-[22px] font-semibold tracking-[-0.04em] text-ms-ink">axiom</span>
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-[40rem] flex-1 flex-col items-center justify-center px-4 pb-24 text-center">
        <div className="relative flex flex-col items-center" aria-hidden="true">
          <div className="rocket-idle">
            <RocketGlyph flame={false} width={104} height={208} className="rotate-[14deg]" />
          </div>
          {/* The glyph's box keeps room below the nozzle for a flame that's off here; the shadow tucks up into it. */}
          <span className="rocket-idle-shadow -mt-12 block h-3.5 w-28 rounded-[50%] bg-ms-ink/10" />
        </div>

        <p className="mt-8 text-[13px] font-medium tracking-[0.02em] text-ms-muted">{kicker}</p>
        <h1 className="ms-display mt-3 text-[clamp(2.6rem,7vw,4.4rem)] text-ms-ink">{title}</h1>
        <div className="mt-4 max-w-[34rem] text-[17px] leading-relaxed text-ms-body">{children}</div>

        <div className="mt-9 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
          <Link href={primary.href} className="ms-pill h-14 w-full px-8 text-[16px] sm:w-auto">
            {primary.label}
          </Link>
          {secondary ? (
            <Link
              href={secondary.href}
              className="inline-flex h-14 w-full items-center justify-center rounded-full bg-white px-8 text-[16px] font-medium text-ms-ink shadow-[inset_0_0_0_1px_rgb(23_25_28_/_0.12)] transition-colors hover:bg-ms-mist sm:w-auto"
            >
              {secondary.label}
            </Link>
          ) : null}
        </div>
      </main>
    </div>
  );
}
