import type { HqStatus, Side } from "@/lib/data/hq/types";
import { dayKey } from "@/lib/data/hq/aggregate";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-09-24" → "Sep 24". String maths, so server and browser agree. */
export function shortDate(iso: string): string {
  const [, month, day] = iso.slice(0, 10).split("-").map(Number);
  return `${MONTHS[month - 1]} ${day}`;
}

/** A timestamp → "Sep 24", as a Houston day. */
export function shortDay(timestamp: string): string {
  return shortDate(dayKey(timestamp));
}

export const SIDE_LABEL: Record<Side, string> = { intern: "Intern", startup: "Startup", chapter: "Chapter" };

/** "Accepted" reads differently per side: a startup or chapter is approved, not accepted. */
export function statusLabel(status: HqStatus, side: Side): string {
  switch (status) {
    case "new":
      return "Unread";
    case "read":
      return "Read";
    case "accepted":
      return side === "intern" ? "Accepted" : "Approved";
    case "waitlist":
      return "Waitlist";
    case "rejected":
      return "Not this cycle";
    case "withdrawn":
      return "Withdrawn";
  }
}

/** Tailwind classes per status. Text stays ink; the tint only carries state. */
export const STATUS_TONE: Record<HqStatus, string> = {
  new: "bg-ms-ink text-white",
  read: "bg-ms-sky text-ms-ink",
  accepted: "bg-ms-green text-white",
  waitlist: "bg-[#f1ead6] text-ms-ink",
  rejected: "bg-ms-mist text-ms-muted",
  withdrawn: "bg-ms-mist text-ms-muted",
};
