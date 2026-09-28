import type { Side } from "@/lib/apply-sides";
import { Card, Kicker, PillLink } from "@/components/preview/Card";
import { MOCK_MATCH } from "@/components/preview/mock-data";
import type { ViewStatus } from "@/components/preview/applicant/copy";

/**
 * The one thing worth doing next. Before a decision that is a nudge that
 * genuinely helps (a live link beats a perfect résumé — docs/email-program.md);
 * after one, it is the match, the slate or the plan.
 */

const EDIT = "/preview/after-submit/application";

type Step = { title: string; body: string };

const SLATE = [
  { name: "Test Applicant A", note: "11th grade · AI · Bay Area" },
  { name: "Test Applicant B", note: "12th grade · Engineering · Online" },
  { name: "Test Applicant C", note: "College freshman · AI · Houston" },
];

const CHAPTER_PLAN: Step[] = [
  { title: "Week 1", body: "A call with us, and your first ten members." },
  { title: "Week 2", body: "Kick-off meeting, run from the playbook." },
  { title: "Week 4", body: "First demo day — each member ships one thing." },
];

function waiting(side: Side, status: ViewStatus): Step {
  if (status === "waitlist") return { title: "What moves you up", body: "Something live you made since applying. Add the link — we look again." };
  if (status === "rejected") {
    return side === "intern"
      ? { title: "Next time", body: "Applications reopen in January. A Learn track is the best way to spend the gap." }
      : { title: "Next time", body: "The email says what would change it. You can apply again any time." };
  }
  if (side === "startup") return { title: "While we read", body: "Say what an intern would ship in week one. It's what interns ask first." };
  if (side === "chapter") return { title: "While we review", body: "Line up a teacher who'd advise. It's the first thing we ask." };
  return { title: "While you wait", body: "A link to something live beats a perfect résumé. Add one if you haven't." };
}

export function NextCard({ side, status }: { side: Side; status: ViewStatus }) {
  if (status === "accepted" && side === "intern") {
    return (
      <Card>
        <Kicker>Your match</Kicker>
        <p className="ms-display mt-4 text-[clamp(2.2rem,4vw,3.2rem)] text-ms-ink">{MOCK_MATCH.startup}</p>
        <p className="mt-2 text-[17px] text-ms-body">
          {MOCK_MATCH.role} · starts {MOCK_MATCH.start}
        </p>
        <p className="mt-6 text-[15px] text-ms-body">
          The intro to {MOCK_MATCH.founder} is in your inbox. Reply there — that&rsquo;s the whole next step.
        </p>
      </Card>
    );
  }

  if (status === "accepted" && side === "startup") {
    return (
      <Card>
        <Kicker>Your first slate</Kicker>
        <ul className="mt-4 flex flex-col">
          {SLATE.map((person) => (
            <li key={person.name} className="flex items-center justify-between gap-4 border-t border-ms-mist py-3 first:border-t-0">
              <span>
                <span className="block text-[16px] font-medium text-ms-ink">{person.name}</span>
                <span className="block text-[13px] text-ms-muted">{person.note}</span>
              </span>
              <span className="rounded-full bg-ms-mist px-4 py-2 text-[14px] font-medium text-ms-ink">Request</span>
            </li>
          ))}
        </ul>
      </Card>
    );
  }

  if (status === "accepted" && side === "chapter") {
    return (
      <Card>
        <Kicker>Your first thirty days</Kicker>
        <ol className="mt-4 flex flex-col">
          {CHAPTER_PLAN.map((step) => (
            <li key={step.title} className="grid grid-cols-[5rem_1fr] gap-3 border-t border-ms-mist py-3 first:border-t-0">
              <span className="text-[14px] font-medium text-ms-green">{step.title}</span>
              <span className="text-[16px] text-ms-ink">{step.body}</span>
            </li>
          ))}
        </ol>
      </Card>
    );
  }

  const step = waiting(side, status);
  return (
    <Card>
      <Kicker>{step.title}</Kicker>
      <p className="mt-4 max-w-[32rem] text-[24px] leading-[1.2] font-medium tracking-[-0.03em] text-ms-ink">{step.body}</p>
      {status !== "rejected" ? (
        <div className="mt-6">
          <PillLink href={EDIT} tone="light">
            Add to your application
          </PillLink>
        </div>
      ) : null}
    </Card>
  );
}
