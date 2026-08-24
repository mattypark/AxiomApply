import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import {
  CAREERS_EMAIL,
  CAREER_PROCESS,
  OPEN_ROLES,
} from "@/lib/careers";

export const metadata = {
  title: "Careers",
  description:
    "Work at Axiom Pathways. Open roles across engineering, chapters, partnerships, curriculum, brand, and operations — picked for what you have shipped.",
};

export default function CareersPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[900px] flex-col px-5 pt-10 pb-40 sm:px-8">
      <Link
        href="/"
        className="w-fit text-[0.85rem] text-muted transition-[color,transform] duration-300 hover:-translate-x-1 hover:text-ink"
      >
        ← Back
      </Link>

      <Reveal className="mt-20 sm:mt-28">
        <h1 className="text-center font-display text-[clamp(3rem,11vw,7rem)] leading-[0.95] font-normal tracking-[-0.03em]">
          {/* The same left-to-right green sweep the page footer closes on, so
              the two big display lines on the site read as one system. */}
          <span
            style={{
              backgroundImage:
                "linear-gradient(90deg, #1d4527 0%, #2f6b3d 34%, #3f8f52 67%, #6cc47f 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Careers
          </span>
        </h1>
      </Reveal>

      <Reveal delay={0.08} className="mt-14 sm:mt-20">
        <p className="max-w-[52ch] text-[1.05rem] leading-relaxed text-muted">
          Axiom Pathways is a nonprofit run by the same people it exists for —
          students who ship. We place high schoolers and early-college builders
          into real startup work, and the team that makes that happen is small
          on purpose. Every role below owns a surface outright.{" "}
          <Link
            href="/about/learn"
            className="font-medium text-ink underline decoration-forest/40 underline-offset-4 transition-colors hover:text-forest"
          >
            Read who we are
          </Link>
          .
        </p>
      </Reveal>

      <Reveal delay={0.14} className="mt-20 sm:mt-24">
        <span className="kicker">Open positions</span>
      </Reveal>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {OPEN_ROLES.map((role, index) => (
          <Reveal key={role.slug} delay={0.18 + index * 0.05}>
            <Link
              href={`/careers/${role.slug}`}
              className="group flex h-full flex-col gap-1 rounded-[20px] bg-ink/[0.035] p-7 transition-[background-color,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:bg-ink/[0.06]"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-[1.25rem] font-semibold tracking-tight text-ink">
                  {role.title}
                </h2>
                <span
                  aria-hidden
                  className="mt-1 text-[0.85rem] text-faint transition-[transform,color] duration-300 group-hover:translate-x-0.5 group-hover:text-forest"
                >
                  →
                </span>
              </div>
              <p className="text-[0.88rem] text-muted">
                {role.team} · {role.commitment}
              </p>
              <p className="mt-3 text-[0.92rem] leading-relaxed text-muted">
                {role.summary}
              </p>
            </Link>
          </Reveal>
        ))}
      </div>

      <div className="mt-24 grid gap-12 sm:grid-cols-2 sm:gap-10">
        <Reveal delay={0.1}>
          <span className="kicker">Process</span>
          <ol className="mt-4 flex flex-col gap-3">
            {CAREER_PROCESS.map((step, index) => (
              <li key={step} className="flex gap-3 text-[0.95rem] leading-relaxed text-muted">
                <span className="font-mono text-[0.75rem] text-faint">
                  0{index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </Reveal>

        <Reveal delay={0.16}>
          <span className="kicker">Don&apos;t see your role?</span>
          <p className="mt-4 max-w-[36ch] text-[0.95rem] leading-relaxed text-muted">
            Write to us anyway. Tell us what you would own and send the thing
            you built that proves it — that is the whole application.
          </p>
          <a
            href={`mailto:${CAREERS_EMAIL}?subject=Working%20at%20Axiom`}
            className="kicker mt-5 inline-flex items-center gap-2 text-ink transition-colors duration-200 hover:text-forest"
          >
            Email us
            <span aria-hidden>→</span>
          </a>
        </Reveal>
      </div>
    </main>
  );
}
