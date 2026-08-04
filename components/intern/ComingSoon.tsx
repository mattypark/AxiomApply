import { GlassPanel } from "@/components/glass/GlassPanel";
import { Reveal } from "@/components/motion/Reveal";

export function ComingSoon({
  kicker,
  title,
  copy,
}: {
  kicker: string;
  title: string;
  copy: string;
}) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 py-6">
      <Reveal>
        <span className="kicker">{kicker}</span>
      </Reveal>
      <Reveal delay={0.06}>
        <h1 className="text-[clamp(1.8rem,4.5vw,2.6rem)] font-semibold tracking-tight text-ink">
          {title}
        </h1>
      </Reveal>
      <Reveal delay={0.14}>
        <GlassPanel specular className="p-7">
          <p className="max-w-[52ch] leading-relaxed text-muted">{copy}</p>
        </GlassPanel>
      </Reveal>
    </main>
  );
}
