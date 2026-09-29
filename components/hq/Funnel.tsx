import type { FunnelStep } from "@/lib/data/hq/types";

/**
 * Received → read → decided → accepted. Each bar is its share of
 * everything received; the small number is the step-to-step rate, which is
 * the one to watch ("are we reading fast enough?"). Withdrawn applications
 * are left out so they don't read as a reviewing backlog.
 */
export function Funnel({ steps }: { steps: FunnelStep[] }) {
  const first = Math.max(steps[0]?.value ?? 0, 1);
  return (
    <ol className="flex flex-col gap-4" aria-label="Status funnel">
      {steps.map((step, i) => {
        const previous = i === 0 ? null : steps[i - 1].value;
        const rate = previous ? Math.round((step.value / previous) * 100) : null;
        return (
          <li key={step.key}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[14px] text-ms-body">{step.label}</span>
              <span className="tabular-nums">
                {rate !== null ? <span className="mr-2 text-[12px] text-ms-muted">{rate}% of {steps[i - 1].label.toLowerCase()}</span> : null}
                <span className="text-[20px] font-medium tracking-[-0.03em] text-ms-ink">{step.value}</span>
              </span>
            </div>
            <div aria-hidden="true" className="mt-1.5 h-3 w-full rounded-[4px] bg-ms-mist">
              <div
                className="h-full origin-left rounded-[4px] bg-ms-green transition-transform duration-700 ease-ms motion-reduce:transition-none"
                style={{ transform: `scaleX(${Math.max(step.value / first, 0.01)})`, opacity: 1 - i * 0.16 }}
              />
            </div>
          </li>
        );
      })}
    </ol>
  );
}
