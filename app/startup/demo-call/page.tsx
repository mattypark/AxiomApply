import { GlassPanel } from "@/components/glass/GlassPanel";
import { Reveal } from "@/components/motion/Reveal";
import { InquiryForm } from "@/components/startup/InquiryForm";
import { getUser } from "@/lib/auth";

export const metadata = { title: "Demo call" };

export default async function DemoCallPage() {
  const user = await getUser();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 py-6">
      <div>
        <Reveal>
          <span className="kicker">Demo call</span>
        </Reveal>
        <Reveal delay={0.06}>
          <h1 className="mt-2 text-[clamp(1.9rem,5vw,3rem)] font-semibold tracking-tight text-ink">
            15 minutes. Founders only.
          </h1>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mt-2 max-w-[52ch] text-muted">
            Tell us what you&apos;re building and who you need — we start
            matching the same week. Two ways in:
          </p>
        </Reveal>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <Reveal delay={0.18}>
          <GlassPanel variant="deep" className="flex h-full flex-col gap-5 p-7">
            <span className="kicker">Request the call</span>
            <InquiryForm defaultEmail={user?.email ?? undefined} />
          </GlassPanel>
        </Reveal>

        <Reveal delay={0.24}>
          <GlassPanel variant="dark" specular className="flex h-full flex-col justify-between gap-8 p-7">
            <div>
              <span className="kicker text-mint">Prefer email?</span>
              <p className="mt-3 text-[1.05rem] font-medium leading-relaxed">
                Straight to the founders — we read everything same-day.
              </p>
            </div>
            <a
              href="mailto:matthew@axiompathways.org?subject=Startup%20demo%20call"
              className="w-fit rounded-full bg-night-text px-6 py-3 text-[0.9rem] font-semibold text-night transition-transform duration-300 hover:-translate-y-0.5"
            >
              matthew@axiompathways.org →
            </a>
          </GlassPanel>
        </Reveal>
      </div>
    </main>
  );
}
