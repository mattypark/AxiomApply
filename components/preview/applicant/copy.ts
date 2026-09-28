import type { Side } from "@/lib/apply-sides";
import type { Outcome, Stage } from "@/components/preview/mock-data";
import { MOCK_MATCH } from "@/components/preview/mock-data";

/**
 * Every word on the applicant home, by side and status. Kept apart from the
 * layout so the copy can be argued about without touching components.
 *
 * The promises (14 days, a few days, a week) are the ones the Done screen
 * already makes (components/onboarding/flow/Done.tsx); nothing new is promised.
 */

export type ViewStatus = "received" | "read" | "accepted" | "waitlist" | "rejected";

export function toStage(status: ViewStatus): { stage: Stage; outcome: Outcome | null } {
  if (status === "received" || status === "read") return { stage: status, outcome: null };
  return { stage: "decided", outcome: status };
}

type Lines = { title: string; line: string };

export function heroCopy(side: Side, status: ViewStatus, first: string, by: string): Lines {
  const table: Record<Side, Record<ViewStatus, Lines>> = {
    intern: {
      received: { title: `It's in, ${first}.`, line: `A person reads every one. You hear back by ${by}, either way.` },
      read: { title: "Matthew has read it.", line: `A decision comes by ${by}, either way.` },
      accepted: { title: `You're matched, ${first}.`, line: `${MOCK_MATCH.startup} wants to meet you.` },
      waitlist: { title: "You're on the waitlist.", line: "When a seat opens, we come to this list first." },
      rejected: { title: "Not this cycle.", line: "It was read closely. Applications reopen in January." },
    },
    startup: {
      received: { title: "It's in.", line: `Matthew reads every startup by hand — by ${by}.` },
      read: { title: "Being read now.", line: `You hear back by ${by}.` },
      accepted: { title: "You're approved.", line: "Your first slate of interns is ready." },
      waitlist: { title: "Not yet — soon.", line: "We're matching this season's interns first. You're next." },
      rejected: { title: "Not this season.", line: "The email has the reason. You can apply again anytime." },
    },
    chapter: {
      received: { title: "It's in.", line: `Chapters are approved one at a time — by ${by}.` },
      read: { title: "In review.", line: "A person has it and may reach out with a question." },
      accepted: { title: "Your chapter is approved.", line: "Now we plan your first thirty days together." },
      waitlist: { title: "Almost.", line: "We're opening a few schools at a time. Yours is on the list." },
      rejected: { title: "Not this time.", line: "The email says why, and what would change it." },
    },
  };
  return table[side][status];
}

export type Mail = { subject: string; at: string | null; note: string };

/** The emails this person has had (and the next one), from docs/email-program.md. */
export function mailFor(side: Side, status: ViewStatus, dates: { sent: string; decided: string; by: string }): Mail[] {
  const received: Mail = { subject: "Got it.", at: dates.sent, note: "Application received" };
  const decisionSubject: Record<Side, Partial<Record<ViewStatus, string>>> = {
    intern: {
      accepted: `You're matched with ${MOCK_MATCH.startup}.`,
      waitlist: "You're on the waitlist.",
      rejected: "Not this cycle.",
    },
    startup: { accepted: "Example Labs is approved.", waitlist: "Soon.", rejected: "Not this season." },
    chapter: { accepted: "Your chapter is approved.", waitlist: "Almost.", rejected: "Not this time." },
  };
  const subject = decisionSubject[side][status];
  if (subject) return [received, { subject, at: dates.decided, note: "Decision" }];
  return [received, { subject: "The decision", at: null, note: `Arrives by ${dates.by}` }];
}

export const STATUS_OPTIONS: { value: ViewStatus; label: string }[] = [
  { value: "received", label: "Received" },
  { value: "read", label: "Read" },
  { value: "accepted", label: "Accepted" },
  { value: "waitlist", label: "Waitlist" },
  { value: "rejected", label: "Not this cycle" },
];

export type ViewState = "ready" | "none" | "loading" | "error";

export const STATE_OPTIONS: { value: ViewState; label: string }[] = [
  { value: "ready", label: "Applied" },
  { value: "none", label: "No application" },
  { value: "loading", label: "Loading" },
  { value: "error", label: "Error" },
];

export function pick<T extends string>(value: string | undefined, options: { value: T }[], fallback: T): T {
  return options.find((option) => option.value === value)?.value ?? fallback;
}
