import type { Side } from "@/lib/apply-sides";
import type { MockApplication, Outcome } from "@/components/preview/mock-data";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-09-24" → "Sep 24". String maths, so server and browser agree. */
export function shortDate(iso: string): string {
  const [, month, day] = iso.split("-").map(Number);
  return `${MONTHS[month - 1]} ${day}`;
}

/** Add days to a YYYY-MM-DD string. */
export function addDays(iso: string, days: number): string {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day) + days * 86_400_000).toISOString().slice(0, 10);
}

/** How long each side waits for an answer — the promise the Done screen makes. */
export const ANSWER_WITHIN: Record<Side, number> = { intern: 14, startup: 4, chapter: 7 };

/**
 * One status word for the whole dashboard. "Accepted" reads differently per
 * side: a startup or chapter is approved, not accepted.
 */
export type BoardStatus = "new" | "read" | Outcome;

export function boardStatus(app: MockApplication): BoardStatus {
  if (app.outcome) return app.outcome;
  return app.readAt ? "read" : "new";
}

export function statusLabel(status: BoardStatus, side: Side): string {
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
export const STATUS_TONE: Record<BoardStatus, string> = {
  new: "bg-ms-ink text-white",
  read: "bg-ms-sky text-ms-ink",
  accepted: "bg-ms-green text-white",
  waitlist: "bg-[#f1ead6] text-ms-ink",
  rejected: "bg-ms-mist text-ms-muted",
  withdrawn: "bg-ms-mist text-ms-muted",
};

export const SIDE_LABEL: Record<Side, string> = { intern: "Intern", startup: "Startup", chapter: "Chapter" };
