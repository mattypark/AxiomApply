import type { Kpis } from "@/components/preview/hq/stats";

/**
 * The four numbers someone opening HQ wants before anything else: how many,
 * how many new, how many nobody has read, and how long a person waits for a
 * first read. One white strip with hairlines rather than four cards — it
 * reads as one sentence, and at a glance.
 */
export function KpiStrip({ kpis, rangeLabel }: { kpis: Kpis; rangeLabel: string }) {
  const delta = kpis.thisWeek - kpis.lastWeek;
  const items = [
    { label: `Applications · ${rangeLabel}`, value: String(kpis.total), note: null },
    {
      label: "This week",
      value: String(kpis.thisWeek),
      note: `${delta >= 0 ? "+" : "−"}${Math.abs(delta)} vs last week`,
    },
    {
      label: "Unread",
      value: String(kpis.unread),
      note: kpis.unread ? `oldest ${kpis.oldestUnreadDays}d` : "all read",
      // Past the 14-day promise, an unread application is a broken promise.
      warn: kpis.oldestUnreadDays > 10,
    },
    {
      label: "Median wait to first read",
      value: kpis.medianDaysToRead === null ? "—" : `${kpis.medianDaysToRead}d`,
      note: "promise: 14d to decision",
    },
  ];

  return (
    <dl className="grid grid-cols-2 overflow-hidden rounded-[28px] bg-white shadow-[0_0_0_1px_rgb(23_25_28_/_0.05)] lg:grid-cols-4">
      {items.map((item, i) => (
        <div
          key={item.label}
          className={`flex flex-col gap-1 p-5 sm:p-7 ${i % 2 === 1 ? "border-l border-ms-mist" : ""} ${
            i > 1 ? "border-t border-ms-mist lg:border-t-0" : ""
          } ${i === 2 ? "lg:border-l" : ""}`}
        >
          <dt className="text-[13px] text-ms-muted">{item.label}</dt>
          <dd className="ms-display text-[clamp(2.2rem,4vw,3.4rem)] text-ms-ink tabular-nums">{item.value}</dd>
          {item.note ? (
            <dd className={`text-[13px] ${"warn" in item && item.warn ? "font-medium text-[#a4442c]" : "text-ms-muted"}`}>
              {"warn" in item && item.warn ? "Overdue · " : ""}
              {item.note}
            </dd>
          ) : null}
        </div>
      ))}
    </dl>
  );
}
