import { InView } from "@/components/motion/InView";
import { SectionHead } from "@/components/sections/SectionHead";

/**
 * 01 — the problem.
 *
 * The panel is the argument: a stack of roles nobody is reading on the left,
 * a three-line conversation that actually moves on the right. It is drawn, not
 * photographed, because the thing being described is a message thread and any
 * stock image of "networking" would say less than the thread itself.
 *
 * The ghost cards breathe rather than blink — a skeleton that flashes reads as
 * loading, and this one is never going to finish loading.
 */

const ROLES = ["AI", "Computer Science", "Marketing", "Finance", "Design"] as const;

const THREAD = [
  { who: "axiom", line: "Someone here matches the role you posted." },
  { who: "the founder", line: "Send them over." },
  { who: "you", line: "Nothing to fill in. It was already written." },
] as const;

export function ProblemSection() {
  return (
    <section className="bg-paper py-28 sm:py-40">
      <SectionHead
        index="01"
        label="the problem"
        title={
          <>
            Applications go into a pile.
            <br />
            Introductions don&apos;t.
          </>
        }
        subcopy="A founder hiring their first intern is not reading page four of an applicant list. They are asking someone they trust who to talk to. Axiom is that someone."
      />

      <InView delay={120} className="mx-auto mt-16 w-full max-w-[68rem] px-6">
        <div className="grid gap-6 rounded-[24px] bg-card p-6 shadow-float sm:p-10 lg:grid-cols-2 lg:gap-12">
          {/* The pile. Unreadable on purpose — the labels are the only part
              that survives being one of four hundred. */}
          <div className="flex flex-col gap-3">
            {ROLES.map((role, index) => (
              <div
                key={role}
                className="ax-skeleton flex items-center gap-4 rounded-[16px] bg-paper px-5 py-4"
                style={{ animationDelay: `${index * 160}ms` }}
              >
                <span className="h-9 w-9 shrink-0 rounded-full bg-ink/[0.07]" />
                <span className="flex flex-1 flex-col gap-2">
                  <span className="h-2 w-2/3 rounded-full bg-ink/[0.07]" />
                  <span className="font-mono text-[0.7rem] tracking-[0.08em] text-faint uppercase">
                    {role}
                  </span>
                </span>
              </div>
            ))}
          </div>

          {/* The thread. */}
          <div className="flex flex-col justify-center gap-4">
            {THREAD.map((message, index) => (
              <InView
                key={message.who}
                delay={220 + index * 90}
                className="rounded-[16px] bg-paper px-5 py-4 shadow-[0_1px_3px_rgba(21,21,15,0.05)]"
              >
                <p className="font-mono text-[0.7rem] tracking-[0.08em] text-faint uppercase">
                  {message.who}
                </p>
                <p className="mt-1.5 text-[1.0625rem] leading-[1.45] text-ink">
                  {message.line}
                </p>
              </InView>
            ))}

            <InView
              delay={520}
              className="mt-2 flex items-center gap-2.5 px-1"
            >
              <span className="h-2 w-2 rounded-full bg-forest" />
              <span className="font-mono text-[0.7rem] tracking-[0.08em] text-muted uppercase">
                Introduction sent · matched by hand
              </span>
            </InView>
          </div>
        </div>
      </InView>
    </section>
  );
}
