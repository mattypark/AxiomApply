import Link from "next/link";
import { GlassPanel } from "@/components/glass/GlassPanel";
import { Reveal } from "@/components/motion/Reveal";
import { getMyChapter, type MyChapter } from "@/lib/chapters";
import { getProfile, getUser } from "@/lib/auth";

export const metadata = { title: "Chapter HQ" };

/**
 * Chapter dashboard.
 *
 * Shaped like the startup HQ rather than the intern workspace, because running
 * a chapter is a management job: what state is it in, what is outstanding, what
 * is the next thing to do. Everything on this page is derived from the chapter
 * row — nothing is invented, and the parts of the product that do not exist yet
 * (a member roster, meeting history) say so instead of showing a fake number.
 */

type Step = { label: string; hint: string; done: boolean };

function launchSteps(chapter: MyChapter): Step[] {
  const filled = (value: string | null) => Boolean(value?.trim());

  return [
    {
      label: "Faculty advisor confirmed",
      hint:
        chapter.advisor_name?.trim() ||
        "A teacher who will put their name on it. Most schools will not approve a club without one.",
      done: chapter.advisor_status === "Yes, confirmed",
    },
    {
      label: "Meeting rhythm picked",
      hint:
        chapter.cadence && chapter.cadence !== "Not sure yet"
          ? `${chapter.cadence} — put the first three in a calendar now, while it is easy.`
          : "Pick one and stick to it. An unpredictable meeting is the most common way a chapter quietly ends.",
      done: Boolean(chapter.cadence) && chapter.cadence !== "Not sure yet",
    },
    {
      label: "First ten members named",
      hint: "Not a poster — ten people you can name and ask directly. That is what actually fills a first meeting.",
      done: filled(chapter.first_members),
    },
    {
      label: "A local founder to call",
      hint: "One real founder near you beats a list of famous ones. We will make the introduction if you name the target.",
      done: filled(chapter.startups_local),
    },
  ];
}

export default async function ChapterHomePage() {
  const [user, profile, chapter] = await Promise.all([
    getUser(),
    getProfile(),
    getMyChapter(),
  ]);

  // The layout gate already guarantees an approved chapter; this narrows the
  // type rather than re-deciding access.
  if (!chapter) return null;

  const firstName =
    chapter.name?.split(" ")[0] ??
    profile?.display_name?.split(" ")[0] ??
    user?.email?.split("@")[0] ??
    "there";

  const steps = launchSteps(chapter);
  const done = steps.filter((step) => step.done).length;

  const alsoWants = (chapter.also_interested ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
  const wantsIntern = alsoWants.includes("Intern placement");
  const wantsStartup = alsoWants.includes("I run a startup");

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 py-6">
      <div>
        <Reveal>
          <span className="kicker">Chapter HQ</span>
        </Reveal>
        <Reveal delay={0.06}>
          <h1 className="mt-2 text-[clamp(1.9rem,5vw,3rem)] font-semibold tracking-tight text-ink">
            {chapter.school ?? "Your chapter"}.
          </h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-3 text-[0.95rem] text-muted">
            Yours to run, {firstName}.
          </p>
        </Reveal>
      </div>

      {/* status row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Reveal delay={0.12}>
          <GlassPanel specular className="flex h-full flex-col gap-2 p-6">
            <span className="kicker">Status</span>
            <p className="text-[1.4rem] font-semibold tracking-tight text-ink">
              Approved
            </p>
            <p className="text-[0.85rem] leading-relaxed text-muted">
              Approved{" "}
              {new Date(chapter.submitted_at).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
              . One chapter per school, and this one is yours.
            </p>
          </GlassPanel>
        </Reveal>
        <Reveal delay={0.18}>
          <GlassPanel specular className="flex h-full flex-col gap-2 p-6">
            <span className="kicker">Members</span>
            <p className="text-[1.4rem] font-semibold tracking-tight text-ink">
              Roster not open
            </p>
            <p className="text-[0.85rem] leading-relaxed text-muted">
              Sign-ups are not built yet — for now keep the list yourself and{" "}
              <Link href="/chapter/members" className="font-medium text-forest">
                see what is coming →
              </Link>
            </p>
          </GlassPanel>
        </Reveal>
        <Reveal delay={0.24}>
          <GlassPanel specular className="flex h-full flex-col gap-2 p-6">
            <span className="kicker">Rhythm</span>
            <p className="text-[1.4rem] font-semibold tracking-tight text-ink">
              {chapter.cadence && chapter.cadence !== "Not sure yet"
                ? chapter.cadence
                : "Not set"}
            </p>
            <p className="text-[0.85rem] leading-relaxed text-muted">
              {chapter.cadence && chapter.cadence !== "Not sure yet"
                ? "What you told us when you applied. Change it once, not weekly."
                : "Pick a cadence before the first meeting, not after."}
            </p>
          </GlassPanel>
        </Reveal>
      </div>

      {/* launch checklist */}
      <Reveal delay={0.3}>
        <GlassPanel variant="deep" className="flex flex-col gap-5 p-7">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <span className="kicker">Getting it off the ground</span>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-ink">
                The four that decide it.
              </h2>
            </div>
            <span className="font-mono text-[0.8rem] tracking-[0.14em] text-faint uppercase">
              {done}/{steps.length}
            </span>
          </div>

          <ul className="flex flex-col gap-4">
            {steps.map((step) => (
              <li key={step.label} className="flex gap-3">
                <span
                  aria-hidden
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[0.7rem] ${
                    step.done
                      ? "bg-forest text-white"
                      : "border border-[color:var(--color-faint)] text-faint"
                  }`}
                >
                  {step.done ? "✓" : ""}
                </span>
                <span className="flex flex-col gap-1">
                  <span
                    className={`text-[0.95rem] font-medium ${
                      step.done ? "text-muted line-through" : "text-ink"
                    }`}
                  >
                    {step.label}
                  </span>
                  <span className="text-[0.85rem] leading-relaxed text-muted">
                    {step.hint}
                  </span>
                </span>
              </li>
            ))}
          </ul>

          <p className="text-[0.82rem] leading-relaxed text-faint">
            Ticked from what you wrote in your application. Reply to your
            confirmation email when one of these changes and it gets updated.
          </p>
        </GlassPanel>
      </Reveal>

      {/* what's next — the additive part */}
      {(wantsIntern || wantsStartup) && (
        <Reveal delay={0.36}>
          <GlassPanel className="flex flex-col gap-4 p-7">
            <div>
              <span className="kicker">While you are here</span>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-ink">
                Running a chapter does not use up your other options.
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {wantsIntern && (
                <Link
                  href="/onboarding?side=intern"
                  className="rounded-full bg-forest px-6 py-3 text-[0.9rem] font-medium text-white transition-transform duration-300 hover:-translate-y-0.5"
                >
                  Apply for a placement →
                </Link>
              )}
              {wantsStartup && (
                <Link
                  href="/onboarding?side=startup"
                  className="rounded-full border border-[color:var(--color-faint)] px-6 py-3 text-[0.9rem] font-medium text-ink transition-transform duration-300 hover:-translate-y-0.5"
                >
                  Bring your startup in →
                </Link>
              )}
            </div>
          </GlassPanel>
        </Reveal>
      )}

      {/* playbook teaser */}
      <Reveal delay={0.42}>
        <GlassPanel
          variant="dark"
          specular
          className="flex flex-wrap items-center justify-between gap-5 p-7"
        >
          <div>
            <span className="kicker text-mint">Playbook</span>
            <p className="mt-2 max-w-[40ch] text-[1.05rem] font-medium leading-relaxed">
              How to run a first meeting that people come back from.
            </p>
          </div>
          <Link
            href="/chapter/playbook"
            className="rounded-full bg-night-text px-6 py-3 text-[0.9rem] font-medium text-night transition-transform duration-300 hover:-translate-y-0.5"
          >
            Read it →
          </Link>
        </GlassPanel>
      </Reveal>

      <p className="text-[0.85rem] text-muted">
        Account settings live{" "}
        <Link href="/account" className="font-medium text-forest">
          here →
        </Link>
      </p>
    </main>
  );
}
