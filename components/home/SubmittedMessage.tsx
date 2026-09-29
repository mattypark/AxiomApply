import { RocketMessage } from "@/components/RocketMessage";

/**
 * "Application submitted": what /home shows someone who has applied. Shared
 * with the prototype (/preview/after-submit/submitted) so the design can be
 * checked without a real application.
 *
 * It never shows a decision. Decision mail goes out in batches from the
 * Decisions desk, and the site must not tell someone before their email does.
 */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** The promise the Done screen makes: interns hear back in 14 days, chapters within a week. */
const ANSWER_DAYS = { intern: 14, chapter: 7 } as const;

function day(iso: string, plusDays = 0): string {
  const date = new Date(Date.parse(iso) + plusDays * 86_400_000);
  return `${MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}`;
}

function firstName(name: string | null | undefined): string | null {
  const first = name?.trim().split(/\s+/)[0];
  return first && !first.includes("@") ? first : null;
}

export type Submitted = {
  side: keyof typeof ANSWER_DAYS;
  submittedAt: string;
  name: string | null;
  email: string;
  /** Still undecided: show when they'll hear. Decided: only say the answer comes by email. */
  open: boolean;
};

export function SubmittedMessage({ side, submittedAt, name, email, open }: Submitted) {
  const first = firstName(name);
  return (
    <RocketMessage
      lit
      kicker="Application submitted"
      title={first ? `It’s in, ${first}.` : "It’s in."}
      primary={{ href: "/internships", label: "Browse internships" }}
      secondary={{ href: "/", label: "Back to Axiom" }}
    >
      <p>
        Sent {day(submittedAt)}. A person reads every application.{" "}
        {open
          ? `You’ll hear from us by ${day(submittedAt, ANSWER_DAYS[side])}, either way, at ${email}.`
          : `Our answer comes by email, to ${email}.`}
      </p>
    </RocketMessage>
  );
}
