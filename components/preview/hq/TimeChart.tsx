"use client";

import { useEffect, useRef, useState } from "react";
import type { Side } from "@/lib/apply-sides";
import type { Day } from "@/components/preview/hq/stats";
import { SIDE_LABEL, shortDate } from "@/components/preview/labels";

/**
 * Applications per day, stacked by side. Hand-built SVG, no chart library:
 * it is one small figure and a dependency would outweigh the page.
 *
 * Colours are fixed per side (never by rank), drawn in the same order every
 * time — intern at the base, chapter on top — with a 2px gap between
 * segments. Chapter is grey on purpose (the chapter path is black and
 * white), so it is never told apart by colour alone: the legend, the
 * tooltip and the table all name it.
 */

export const SIDE_MARK: Record<Side, string> = { intern: "#4e9a66", startup: "#4f6fc9", chapter: "#9a9ea3" };
const ORDER: Side[] = ["intern", "startup", "chapter"];
const HEIGHT = 220;
const PAD = { top: 12, right: 8, bottom: 26, left: 30 };

function niceMax(value: number) {
  if (value <= 4) return 4;
  const step = Math.pow(10, Math.floor(Math.log10(value)));
  const nice = [1, 2, 2.5, 5, 10].map((m) => m * step).find((m) => m >= value / 2) ?? step * 10;
  return Math.ceil(value / nice) * nice;
}

/** A column segment with only its top corners rounded. */
function topRounded(x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h);
  return `M${x},${y + h}V${y + rr}Q${x},${y} ${x + rr},${y}H${x + w - rr}Q${x + w},${y} ${x + w},${y + rr}V${y + h}Z`;
}

export function TimeChart({ days, sides }: { days: Day[]; sides: Side[] }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const node = wrapRef.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(260, entry.contentRect.width)));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const shown = ORDER.filter((side) => sides.includes(side));
  const totals = days.map((day) => shown.reduce((sum, side) => sum + day[side], 0));
  const top = niceMax(Math.max(...totals, 1));
  const plotW = width - PAD.left - PAD.right;
  const plotH = HEIGHT - PAD.top - PAD.bottom;
  const slot = plotW / days.length;
  const gap = slot > 8 ? 2 : 1;
  const barW = Math.max(1, slot - gap);
  const y = (value: number) => PAD.top + plotH - (value / top) * plotH;

  const sum = totals.reduce((a, b) => a + b, 0);
  const peak = totals.indexOf(Math.max(...totals));
  const summary = `Applications per day over ${days.length} days: ${sum} in total, busiest ${shortDate(days[peak].date)} with ${totals[peak]}.`;
  const labelEvery = Math.ceil(days.length / Math.max(2, Math.floor(plotW / 70)));
  const hover = active === null ? null : days[active];

  return (
    <div>
      <ul className="mb-4 flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-ms-body" aria-label="Legend">
        {shown.map((side) => (
          <li key={side} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: SIDE_MARK[side] }} aria-hidden="true" />
            {SIDE_LABEL[side]}
            <span className="tabular-nums text-ms-muted">{days.reduce((n, day) => n + day[side], 0)}</span>
          </li>
        ))}
      </ul>

      <div ref={wrapRef} className="relative" onPointerLeave={() => setActive(null)}>
        <svg width={width} height={HEIGHT} viewBox={`0 0 ${width} ${HEIGHT}`} role="img" aria-label={summary} className="block max-w-full">
          {[0, top / 2, top].map((tick) => (
            <g key={tick}>
              <line x1={PAD.left} x2={width - PAD.right} y1={y(tick)} y2={y(tick)} stroke={tick === 0 ? "#c9ced2" : "#eceef0"} />
              <text x={PAD.left - 8} y={y(tick) + 4} textAnchor="end" className="fill-ms-muted text-[11px] tabular-nums">
                {tick}
              </text>
            </g>
          ))}

          {days.map((day, i) => {
            const x = PAD.left + i * slot + gap / 2;
            let base = 0;
            const drawn = shown.filter((side) => day[side] > 0);
            return (
              <g key={day.date} opacity={active === null || active === i ? 1 : 0.4}>
                {drawn.map((side, s) => {
                  const y0 = y(base);
                  base += day[side];
                  const y1 = y(base);
                  // 2px surface gap between stacked segments (not under the base one).
                  const h = Math.max(0.5, y0 - y1 - (s > 0 ? 2 : 0));
                  const isTop = s === drawn.length - 1;
                  return isTop ? (
                    <path key={side} d={topRounded(x, y1, barW, h, 4)} fill={SIDE_MARK[side]} />
                  ) : (
                    <rect key={side} x={x} y={y1} width={barW} height={h} fill={SIDE_MARK[side]} />
                  );
                })}
                {i % labelEvery === 0 ? (
                  <text x={x + barW / 2} y={HEIGHT - 8} textAnchor="middle" className="fill-ms-muted text-[11px]">
                    {shortDate(day.date)}
                  </text>
                ) : null}
                {/* Hit target: the whole column, wider than the mark. */}
                <rect
                  x={PAD.left + i * slot}
                  y={PAD.top}
                  width={slot}
                  height={plotH}
                  fill="transparent"
                  onPointerEnter={() => setActive(i)}
                />
              </g>
            );
          })}
        </svg>

        {hover && active !== null ? (
          <div
            className="pointer-events-none absolute top-0 z-10 w-40 rounded-[14px] bg-ms-ink px-3 py-2 text-[12px] text-white shadow-lg"
            style={{
              left: Math.min(Math.max(0, PAD.left + active * slot - 70), width - 160),
            }}
          >
            <p className="font-medium">{shortDate(hover.date)}</p>
            {shown.map((side) => (
              <p key={side} className="flex justify-between gap-2 tabular-nums">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-[2px]" style={{ background: SIDE_MARK[side] }} />
                  {SIDE_LABEL[side]}
                </span>
                {hover[side]}
              </p>
            ))}
            <p className="mt-1 flex justify-between border-t border-white/20 pt-1 tabular-nums">
              <span>Total</span>
              {totals[active]}
            </p>
          </div>
        ) : null}
      </div>

      <details className="mt-3 text-[13px] text-ms-muted">
        <summary className="cursor-pointer select-none hover:text-ms-ink">Show as table</summary>
        <div className="mt-2 max-h-56 overflow-auto" data-lenis-prevent>
          <table className="w-full text-left tabular-nums">
            <thead>
              <tr className="text-ms-ink">
                <th className="py-1 font-medium">Day</th>
                {shown.map((side) => (
                  <th key={side} className="py-1 font-medium">
                    {SIDE_LABEL[side]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.map((day) => (
                <tr key={day.date} className="border-t border-ms-mist">
                  <td className="py-1">{shortDate(day.date)}</td>
                  {shown.map((side) => (
                    <td key={side} className="py-1">
                      {day[side]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
