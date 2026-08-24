import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/motion/Reveal";
import { CareerApplyForm } from "@/components/careers/CareerApplyForm";
import { CAREERS_EMAIL, CAREER_PROCESS, CAREER_ROLES, getRole } from "@/lib/careers";

/** Every role is content in lib/careers.ts, so all of them prerender. */
export function generateStaticParams() {
  return CAREER_ROLES.map((role) => ({ slug: role.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const role = getRole(slug);
  if (!role) return { title: "Role not found" };

  return {
    title: `${role.title} — Careers`,
    description: role.summary,
  };
}

export default async function CareerRolePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const role = getRole(slug);
  if (!role) notFound();

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[760px] flex-col px-5 pt-10 pb-40 sm:px-8">
      <Link
        href="/careers"
        className="w-fit text-[0.85rem] text-muted transition-[color,transform] duration-300 hover:-translate-x-1 hover:text-ink"
      >
        ← All roles
      </Link>

      <Reveal className="mt-16 sm:mt-20">
        <span className="kicker">{role.team}</span>
        <h1 className="mt-3 font-display text-[clamp(2.4rem,7vw,4.2rem)] leading-[1.02] font-normal tracking-[-0.025em] text-ink">
          {role.title}
        </h1>
      </Reveal>

      <Reveal delay={0.06} className="mt-5 flex flex-wrap gap-2">
        <span className="chip">{role.commitment}</span>
        <span className="chip">{role.location}</span>
        {!role.open && <span className="chip">Closed</span>}
      </Reveal>

      <Reveal delay={0.1}>
        <p className="mt-9 max-w-[54ch] text-[1.05rem] leading-relaxed text-muted">
          {role.intro}
        </p>
      </Reveal>

      <Section title="What you'd do" items={role.whatYouDo} delay={0.16} />
      <Section title="Who fits" items={role.whoFits} delay={0.22} />

      <Reveal delay={0.28} className="mt-14">
        <span className="kicker">First project</span>
        <p className="mt-4 max-w-[48ch] font-display text-[1.35rem] leading-snug text-ink">
          {role.firstProject}
        </p>
      </Reveal>

      <Reveal delay={0.32} className="mt-14">
        <span className="kicker">Process</span>
        <ol className="mt-4 flex flex-col gap-2.5">
          {CAREER_PROCESS.map((step, index) => (
            <li
              key={step}
              className="flex gap-3 text-[0.95rem] leading-relaxed text-muted"
            >
              <span className="font-mono text-[0.75rem] text-faint">
                0{index + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </Reveal>

      <div id="apply" className="mt-20 scroll-mt-8">
        {role.open ? (
          <Reveal delay={0.1}>
            <h2 className="font-display text-[1.9rem] leading-tight font-normal tracking-tight text-ink">
              Apply for {role.title}
            </h2>
            <p className="mt-2 max-w-[46ch] text-[0.95rem] text-muted">
              Links do more work than paragraphs here. Send the thing you built.
            </p>
            <div className="mt-7">
              <CareerApplyForm roleSlug={role.slug} roleTitle={role.title} />
            </div>
          </Reveal>
        ) : (
          <Reveal delay={0.1}>
            <h2 className="font-display text-[1.9rem] leading-tight font-normal tracking-tight text-ink">
              This role is closed.
            </h2>
            <p className="mt-3 max-w-[46ch] text-[0.95rem] leading-relaxed text-muted">
              It may open again next cohort. If it is plainly yours, write to us
              anyway —{" "}
              <a
                href={`mailto:${CAREERS_EMAIL}?subject=${encodeURIComponent(role.title)}`}
                className="font-medium text-ink underline decoration-forest/40 underline-offset-4 transition-colors hover:text-forest"
              >
                {CAREERS_EMAIL}
              </a>
              .
            </p>
            <Link
              href="/careers"
              className="kicker mt-6 inline-flex items-center gap-2 text-ink transition-colors duration-200 hover:text-forest"
            >
              See open roles
              <span aria-hidden>→</span>
            </Link>
          </Reveal>
        )}
      </div>
    </main>
  );
}

function Section({
  title,
  items,
  delay,
}: {
  title: string;
  items: readonly string[];
  delay: number;
}) {
  return (
    <Reveal delay={delay} className="mt-14">
      <span className="kicker">{title}</span>
      <ul className="mt-4 flex flex-col gap-3">
        {items.map((item) => (
          <li
            key={item}
            className="flex gap-3 text-[0.98rem] leading-relaxed text-muted"
          >
            <span aria-hidden className="mt-[0.55em] h-[3px] w-[3px] shrink-0 rounded-full bg-forest" />
            {item}
          </li>
        ))}
      </ul>
    </Reveal>
  );
}
