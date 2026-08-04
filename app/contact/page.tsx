import Link from "next/link";
import { GlassPanel } from "@/components/glass/GlassPanel";
import { Reveal } from "@/components/motion/Reveal";
import { founders } from "@/lib/site-data";

export const metadata = {
  title: "Contact",
  description: "Get in touch with the Axiom Pathways founders.",
};

export default function ContactPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-4xl flex-col px-5 py-10 sm:px-8">
      <Link
        href="/"
        className="w-fit text-[0.85rem] text-muted transition-[color,transform] duration-300 hover:-translate-x-1 hover:text-ink"
      >
        ← Back
      </Link>

      <Reveal className="mt-14">
        <h1 className="text-[clamp(2.2rem,6vw,3.6rem)] font-semibold tracking-tight text-ink">
          Talk to us.
        </h1>
      </Reveal>
      <Reveal delay={0.08}>
        <p className="mt-3 max-w-[44ch] text-muted">
          Two founders. Reach either of us directly — we read everything.
        </p>
      </Reveal>

      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        {founders.map((f, i) => (
          <Reveal key={f.name} delay={0.16 + i * 0.08}>
            <GlassPanel specular className="flex h-full flex-col gap-5 p-8">
              <div>
                <h2 className="text-[1.5rem] font-semibold tracking-tight text-ink">
                  {f.name}
                </h2>
                <span className="kicker mt-1 block">{f.role}</span>
              </div>
              <div className="flex flex-col gap-2.5">
                {f.links.map((l) => (
                  <a
                    key={l.url}
                    href={l.url}
                    target="_blank"
                    rel="noopener"
                    className="w-fit text-[0.95rem] font-medium text-ink transition-colors hover:text-forest"
                  >
                    {l.label} ↗
                  </a>
                ))}
              </div>
            </GlassPanel>
          </Reveal>
        ))}
      </div>

      <p className="mt-auto pt-16 text-[0.95rem] text-muted">
        Prefer to apply?{" "}
        <Link
          href="/apply"
          className="font-medium text-forest transition-colors hover:text-forest-deep"
        >
          Start your application →
        </Link>
      </p>
    </main>
  );
}
