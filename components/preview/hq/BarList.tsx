"use client";

import type { Bar } from "@/components/preview/hq/stats";

/**
 * A ranked list of horizontal bars — chapter, school, grade, interest, side.
 *
 * It is a real list with the numbers printed, so it is its own text
 * alternative; the bars are decoration over it (aria-hidden). Each row is a
 * button: pressing it filters the whole dashboard to that value, pressing it
 * again clears it. The chart that owns a filter still shows every bar (the
 * others dim), so it never collapses to the one you picked.
 *
 * Hovering or focusing a row adds its share of the total — the tooltip,
 * without covering the neighbouring rows.
 */
export function BarList({
  bars,
  selected,
  onSelect,
  colors,
  limit = 8,
  label,
}: {
  bars: Bar[];
  selected?: string | null;
  onSelect?: (label: string | null) => void;
  /** Per-label mark colour (the side chart); otherwise the path colour. */
  colors?: Record<string, string>;
  limit?: number;
  label: string;
}) {
  if (bars.length === 0) {
    return <p className="py-6 text-[14px] text-ms-muted">Nothing in this slice.</p>;
  }

  const shown = bars.slice(0, limit);
  const rest = bars.slice(limit).reduce((sum, bar) => sum + bar.value, 0);
  const max = Math.max(...shown.map((bar) => bar.value), 1);
  const total = bars.reduce((sum, bar) => sum + bar.value, 0);

  return (
    <ul aria-label={label} className="flex flex-col gap-1">
      {shown.map((bar) => {
        const on = selected === bar.label;
        const dim = Boolean(selected) && !on;
        const share = Math.round((bar.value / total) * 100);
        return (
          <li key={bar.label}>
            <button
              type="button"
              aria-pressed={on}
              disabled={!onSelect}
              onClick={() => onSelect?.(on ? null : bar.label)}
              className={`group w-full rounded-[14px] px-2 py-1.5 text-left transition-[background-color,opacity] duration-200 enabled:cursor-pointer enabled:hover:bg-ms-mist ${
                dim ? "opacity-45" : ""
              }`}
            >
              <span className="flex items-baseline justify-between gap-3 text-[14px]">
                <span className={`truncate ${on ? "font-semibold text-ms-ink" : "text-ms-body"}`}>{bar.label}</span>
                <span className="shrink-0 tabular-nums text-ms-ink">
                  <span className="mr-1.5 text-[12px] text-ms-muted opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                    {share}%
                  </span>
                  {bar.value}
                </span>
              </span>
              <span aria-hidden="true" className="mt-1 block h-2 w-full">
                <span
                  className="block h-full origin-left rounded-[4px] transition-transform duration-500 ease-ms motion-reduce:transition-none"
                  style={{
                    transform: `scaleX(${Math.max(bar.value / max, 0.015)})`,
                    background: colors?.[bar.label] ?? "var(--color-ms-green)",
                  }}
                />
              </span>
            </button>
          </li>
        );
      })}
      {rest > 0 ? (
        <li className="px-2 pt-1 text-[13px] text-ms-muted">
          + {bars.length - limit} more · {rest}
        </li>
      ) : null}
    </ul>
  );
}
