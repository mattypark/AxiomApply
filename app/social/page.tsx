import Link from "next/link";
import { GlassPanel } from "@/components/glass/GlassPanel";
import { Reveal } from "@/components/motion/Reveal";
import { socials } from "@/lib/site-data";

export const metadata = {
  title: "Social",
  description: "Follow Axiom Pathways and its founders across social media.",
};

export default function SocialPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-5 py-10 sm:px-8">
      <Link
        href="/"
        className="w-fit text-[0.85rem] text-muted transition-[color,transform] duration-300 hover:-translate-x-1 hover:text-ink"
      >
        ← Back
      </Link>

      <Reveal className="mt-14">
        <h1 className="text-[clamp(2.2rem,6vw,3.6rem)] font-semibold tracking-tight text-ink">
          Find us everywhere.
        </h1>
      </Reveal>
      <Reveal delay={0.08}>
        <p className="mt-3 max-w-[48ch] text-muted">
          What we&apos;re building, who we&apos;re placing, and the rooms
          we&apos;re getting students into — in real time.
        </p>
      </Reveal>

      {socials.map((g, gi) => (
        <section key={g.heading} className="mt-12">
          <span className="kicker">{g.heading}</span>
          <div className="mt-4 flex flex-col gap-3">
            {g.items.map((s, i) => (
              <Reveal key={s.url} delay={0.12 + (gi * 2 + i) * 0.06}>
                <GlassPanel
                  specular
                  className="group transition-[transform,box-shadow] duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-hover)]"
                >
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener"
                    className="grid grid-cols-[1fr_auto_28px] items-baseline gap-4 p-6"
                  >
                    <span className="text-[1.25rem] font-semibold tracking-tight text-ink">
                      {s.platform}
                    </span>
                    <span className="font-mono text-[0.78rem] text-muted">
                      {s.handle}
                    </span>
                    <span className="justify-self-end text-[1.1rem] text-forest transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                      ↗
                    </span>
                  </a>
                </GlassPanel>
              </Reveal>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
