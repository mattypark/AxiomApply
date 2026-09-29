import type { ReactNode } from "react";

/** The home's white card: 28px corners, a hairline, no heavy shadow. */
export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={`rounded-[28px] bg-white p-6 shadow-[0_0_0_1px_rgb(23_25_28_/_0.04),0_18px_40px_-28px_rgb(23_25_28_/_0.3)] sm:p-8 ${className}`}
    >
      {children}
    </section>
  );
}

/** A small grey label above a card's content. */
export function Kicker({ children }: { children: ReactNode }) {
  return <p className="text-[13px] font-medium text-ms-muted">{children}</p>;
}

/** Loading: grey bars where the words will be. Pulse is dropped for reduced motion. */
export function SkeletonCard({ lines = 3, className = "" }: { lines?: number; className?: string }) {
  return (
    <Card className={className}>
      <div aria-hidden="true" className="flex animate-pulse flex-col gap-3 motion-reduce:animate-none">
        <div className="h-3 w-24 rounded-full bg-ms-mist" />
        {Array.from({ length: lines }, (_, i) => (
          <div key={i} className="h-5 rounded-full bg-ms-mist" style={{ width: `${88 - i * 17}%` }} />
        ))}
      </div>
      <span className="sr-only">Loading</span>
    </Card>
  );
}

/**
 * Something failed to load. The line that matters is the reassurance: the
 * Sheet is authoritative, so a broken dashboard never means a lost application.
 */
export function ErrorCard({ onRetry, what = "your application" }: { onRetry?: () => void; what?: string }) {
  return (
    <Card>
      <Kicker>Couldn&rsquo;t load</Kicker>
      <p className="mt-3 text-[22px] font-medium tracking-[-0.03em] text-ms-ink">
        We couldn&rsquo;t show {what} right now.
      </p>
      <p className="mt-2 text-[16px] text-ms-body">It&rsquo;s safe — nothing you sent is lost.</p>
      <button type="button" onClick={onRetry} className="ms-pill mt-6 h-12 cursor-pointer text-[15px]">
        Try again
      </button>
    </Card>
  );
}
