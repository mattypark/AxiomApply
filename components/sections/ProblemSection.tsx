import { InView } from "@/components/motion/InView";
import { Loud, SectionHead } from "@/components/sections/SectionHead";

/**
 * 01 — the problem.
 *
 * klinn's panel, beat for beat: a column of applicant cards nobody is reading
 * on the left, a three-message thread that actually moves on the right, and a
 * quiet status line along the foot. It is drawn, not photographed — the thing
 * being described is a message thread, and any stock image of "networking"
 * would say less than the thread does.
 *
 * The ghost cards breathe rather than blink: a skeleton that flashes reads as
 * loading, and this one is never going to finish loading.
 */

const PILE = [["ai", "marketing"], ["engineering"], ["growth"], ["design"]] as const;

const THREAD = [
  { who: "axiom", line: "someone here matches the role you posted." },
  { who: "the founder", line: "send them over." },
  { who: "you", line: "nothing to fill in. the application is already written." },
] as const;

export function ProblemSection() {
  return (
    <section data-rocket="problem" className="pt-10 pb-24 sm:pb-32">
      <SectionHead
        index="01"
        label="the problem"
        icon="tray"
        title={
          <>
            applications go into a pile.
            <br />
            <em>introductions don&apos;t.</em>
          </>
        }
        subcopy={
          <>
            a founder hiring their first intern is not reading page four of an
            applicant list. they are asking someone they trust who to talk to.{" "}
            <Loud>axiom is that someone.</Loud>
          </>
        }
      />

      <InView delay={120} className="mx-auto mt-12 w-full max-w-[54rem] px-4 sm:px-6">
        <div className="rounded-[20px] bg-white/45 p-5 shadow-[0_0_0_1px_var(--color-border-faint)] sm:p-12">
          <div className="grid gap-10 md:grid-cols-2 md:gap-24">
            {/* The pile. Unreadable on purpose — the role chips are the only
                part that survives being one of four hundred. */}
            <div className="flex flex-col gap-2.5">
              {PILE.map((roles, index) => (
                <div
                  key={roles.join()}
                  className="ax-skeleton flex items-start gap-3 rounded-[12px] bg-white px-3.5 py-3 shadow-[0_0_0_1px_var(--color-border-faint),0_1px_2px_rgba(4,36,16,0.04)]"
                  style={{ animationDelay: `${index * 160}ms` }}
                >
                  <span className="h-7 w-7 shrink-0 rounded-full bg-loud/[0.05]" />
                  <span className="flex flex-1 flex-col gap-1.5 pt-1">
                    <span className="h-1.5 w-2/5 rounded-full bg-loud/[0.07]" />
                    <span className="h-1.5 w-1/5 rounded-full bg-loud/[0.04]" />
                    <span className="mt-1 flex gap-1.5">
                      {roles.map((role) => (
                        <span
                          key={role}
                          className="rounded-[6px] bg-loud/[0.04] px-1.5 py-0.5 text-[11px] text-muted"
                        >
                          {role}
                        </span>
                      ))}
                    </span>
                  </span>
                </div>
              ))}
            </div>

            {/* The thread. */}
            <div className="flex flex-col justify-center gap-2.5">
              {THREAD.map((message, index) => (
                <InView
                  key={message.who}
                  delay={260 + index * 140}
                  className="rounded-[12px] bg-white px-4 py-3 shadow-[0_0_0_1px_var(--color-border-faint),0_8px_24px_-12px_rgba(4,36,16,0.12)]"
                >
                  <p className="flex items-center gap-2 text-[11px] text-muted">
                    <span className="h-3.5 w-3.5 rounded-full bg-loud/[0.06]" />
                    {message.who}
                  </p>
                  <p className="mt-1 pl-[22px] text-[13px] leading-[18px] text-loud">
                    {message.line}
                  </p>
                </InView>
              ))}
            </div>
          </div>

          <InView delay={700} className="mt-10 flex items-center gap-2 text-[11px] sm:mt-16">
            <span className="h-1.5 w-1.5 rounded-full bg-accent/70" />
            <span className="text-accent/80">intro sent</span>
            <span className="text-muted/70">· one application · sent by hand</span>
          </InView>
        </div>
      </InView>
    </section>
  );
}
