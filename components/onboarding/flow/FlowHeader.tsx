import Image from "next/image";
import Link from "next/link";
import { FlightPath } from "@/components/onboarding/flow/FlightPath";

/**
 * The full-page flow's top bar, cut from the welcome page's (EnterShell):
 * the Axiom mark on the left, one quiet way out on the right, and between
 * them the flight path, with its section names under it. On a phone the
 * path drops to its own row under the bar, without the names, so it keeps
 * its length.
 *
 * The way out says "Save and exit" because that is what it does — the draft
 * is already in localStorage, so leaving loses nothing.
 */
export function FlowHeader({
  exitHref,
  flight,
}: {
  exitHref: string;
  /** Omitted on the result screen, where there is nothing left to travel. */
  flight?: { sections: string[]; current: number; within: number; status: string };
}) {
  const trip = flight
    ? { sections: flight.sections, current: flight.current, within: flight.within }
    : null;
  const status = flight ? (
    <span className="shrink-0 text-[13px] text-ms-body tabular-nums">{flight.status}</span>
  ) : null;

  return (
    <header className="relative z-30 mx-auto w-full max-w-[90rem] px-6 sm:px-[6.5%]">
      <div className="flex h-16 items-center gap-8 sm:h-20">
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

        {trip ? (
          <div className="hidden flex-1 items-center gap-6 md:flex">
            <FlightPath {...trip} labels className="flex-1" />
            {status}
          </div>
        ) : null}

        <Link
          href={exitHref}
          className="ml-auto shrink-0 text-[15px] font-medium text-ms-body transition-opacity hover:opacity-60"
        >
          {flight ? "Save and exit" : "Back to home"}
        </Link>
      </div>

      {trip ? (
        <div className="flex items-center gap-4 pb-2 md:hidden">
          <FlightPath {...trip} className="flex-1" />
          {status}
        </div>
      ) : null}
    </header>
  );
}
