import Link from "next/link";
import { GlassPanel } from "@/components/glass/GlassPanel";
import { CenterReveal } from "@/components/motion/CenterReveal";
import { startups, startupSteps } from "@/lib/site-data";

export const metadata = {
  title: "For startups",
  description:
    "Hungry builders, dropped into your startup. Book a call to get matched.",
};

// Startup side — its own material: ink glass on a deep green-black night.
export default function ForStartupsPage() {
  return (
    <div className="fixed inset-0 overflow-y-auto bg-night text-night-text">
      {/* night backdrop glow */}
      <div aria-hidden className="pointer-events-none fixed inset-0">
        <div
          className="backdrop-blob"
          style={{
            top: "-20%",
            right: "-15%",
            width: "60vw",
            height: "60vw",
            background: "rgba(63, 143, 82, 0.10)",
          }}
        />
        <div
          className="backdrop-blob"
          style={{
            bottom: "-25%",
            left: "-10%",
            width: "55vw",
            height: "55vw",
            background: "rgba(47, 107, 61, 0.07)",
          }}
        />
      </div>

      <div className="relative mx-auto flex min-h-dvh w-full max-w-6xl flex-col gap-10 px-5 py-6 sm:px-8">
        <CenterReveal order={3}>
          <header className="flex items-center justify-between gap-4">
            <Link
              href="/"
              className="text-[0.85rem] text-night-muted transition-[color,transform] duration-300 hover:-translate-x-1 hover:text-night-text"
            >
              ← Back
            </Link>
            <span className="kicker text-night-muted">
              Axiom Pathways · For startups
            </span>
          </header>
        </CenterReveal>

        {/* hero — starts right under the header, no dead space */}
        <main className="grid items-start gap-10 lg:grid-cols-[1.5fr_0.85fr]">
          <div>
            <CenterReveal order={0}>
              <h1 className="text-balance text-[clamp(2.6rem,7.5vw,6.2rem)] font-bold leading-[0.96] tracking-[-0.04em]">
                Hungry builders,
                <br />
                dropped into
                <br />
                your startup.
              </h1>
            </CenterReveal>
            <CenterReveal order={1}>
              <p className="mt-6 max-w-[42ch] text-pretty text-[clamp(1.02rem,1.5vw,1.28rem)] leading-normal text-night-muted">
                Young talent picked for passion, not credentials — plugged into
                your team to build what ships.
              </p>
            </CenterReveal>
            <CenterReveal order={2}>
              <div className="mt-8 flex flex-wrap items-center gap-5">
                <a
                  href="mailto:matthew@axiompathways.org?subject=Startup%20intro%20call"
                  className="rounded-full bg-night-text px-7 py-3.5 text-[0.95rem] font-semibold text-night transition-transform duration-300 hover:-translate-y-0.5 active:scale-[0.97]"
                >
                  Book a call →
                </a>
                <span className="kicker text-night-muted">
                  15 min · founders only
                </span>
              </div>
            </CenterReveal>
          </div>

          <CenterReveal order={2}>
            <GlassPanel variant="dark" specular className="flex flex-col gap-4 p-7">
              <span className="kicker text-mint">How it works</span>
              <ul className="flex flex-col gap-3">
                {startupSteps.map((s) => (
                  <li key={s.n} className="flex items-baseline gap-3 text-[1.02rem]">
                    <span className="font-mono text-[0.72rem] tracking-[0.08em] text-mint">
                      {s.n}
                    </span>
                    {s.label}
                  </li>
                ))}
              </ul>
            </GlassPanel>
          </CenterReveal>
        </main>

        {/* the network — every startup, wordmark logo wall */}
        <CenterReveal order={3}>
          <section aria-label="Startups in the network" className="flex flex-col gap-4">
            <span className="kicker text-night-muted">In the network</span>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {startups.map((s) => (
                <GlassPanel
                  key={s.name}
                  variant="dark"
                  specular
                  className="flex min-h-28 flex-col justify-between gap-3 p-5 transition-[transform,box-shadow] duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(0,0,0,0.5)]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[1.15rem] font-bold leading-tight tracking-tight text-white">
                      {s.name}
                    </span>
                    {s.yc && (
                      <span className="shrink-0 rounded-full bg-[rgba(168,213,179,0.14)] px-2.5 py-1 font-mono text-[0.6rem] tracking-[0.08em] text-mint">
                        {s.yc}
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-[0.64rem] leading-relaxed tracking-[0.04em] text-night-muted">
                    {s.meta}
                  </span>
                </GlassPanel>
              ))}
            </div>
          </section>
        </CenterReveal>

        <CenterReveal order={4}>
          <footer className="flex items-baseline justify-between gap-6 pb-2">
            <span className="kicker text-night-muted">
              Ready when you are — matthew@axiompathways.org
            </span>
            <span className="kicker text-night-muted">Axiom Pathways</span>
          </footer>
        </CenterReveal>
      </div>
    </div>
  );
}
