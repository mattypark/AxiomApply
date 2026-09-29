import type { Side } from "@/lib/apply-sides";
import type { HqStatus } from "@/lib/data/hq/types";
import type { MockApplication } from "@/components/preview/mock-data";

export { SIDE_LABEL, STATUS_TONE, shortDate, statusLabel } from "@/components/hq/labels";

/** Add days to a YYYY-MM-DD string. */
export function addDays(iso: string, days: number): string {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day) + days * 86_400_000).toISOString().slice(0, 10);
}

/** How long each side waits for an answer — the promise the Done screen makes. */
export const ANSWER_WITHIN: Record<Side, number> = { intern: 14, startup: 4, chapter: 7 };

/** One status word for the whole dashboard — the same words HQ uses. */
export type BoardStatus = HqStatus;

export function boardStatus(app: MockApplication): BoardStatus {
  if (app.outcome) return app.outcome;
  return app.readAt ? "read" : "new";
}
