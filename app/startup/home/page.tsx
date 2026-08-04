import Link from "next/link";
import { GlassPanel } from "@/components/glass/GlassPanel";
import { Reveal } from "@/components/motion/Reveal";
import { InquiryForm } from "@/components/startup/InquiryForm";
import { getProfile, getUser } from "@/lib/auth";

export const metadata = { title: "Startup HQ" };

// Startup dashboard — same cream glass as the intern side, dashboard shape.
export default async function StartupHomePage() {
  const [user, profile] = await Promise.all([getUser(), getProfile()]);
  const firstName =
    profile?.display_name?.split(" ")[0] ??
    user?.email?.split("@")[0] ??
    "founder";

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 py-6">
      <div>
        <Reveal>
          <span className="kicker">Startup HQ</span>
        </Reveal>
        <Reveal delay={0.06}>
          <h1 className="mt-2 text-[clamp(1.9rem,5vw,3rem)] font-semibold tracking-tight text-ink">
            Welcome back, {firstName}.
          </h1>
        </Reveal>
      </div>

      {/* status row — dashboard tiles */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Reveal delay={0.1}>
          <GlassPanel specular className="flex h-full flex-col gap-2 p-6">
            <span className="kicker">Matching</span>
            <p className="text-[1.4rem] font-semibold tracking-tight text-ink">
              Hand-matched
            </p>
            <p className="text-[0.85rem] leading-relaxed text-muted">
              Every builder is placed by us, not an algorithm — tell us what
              you need below.
            </p>
          </GlassPanel>
        </Reveal>
        <Reveal delay={0.16}>
          <GlassPanel specular className="flex h-full flex-col gap-2 p-6">
            <span className="kicker">Intern pool</span>
            <p className="text-[1.4rem] font-semibold tracking-tight text-ink">
              Filling now
            </p>
            <p className="text-[0.85rem] leading-relaxed text-muted">
              Applications are open — browse the kind of builders coming
              through on{" "}
              <Link href="/startup/interns" className="font-medium text-forest">
                Potential interns →
              </Link>
            </p>
          </GlassPanel>
        </Reveal>
        <Reveal delay={0.22}>
          <GlassPanel specular className="flex h-full flex-col gap-2 p-6">
            <span className="kicker">Next step</span>
            <p className="text-[1.4rem] font-semibold tracking-tight text-ink">
              15-min call
            </p>
            <p className="text-[0.85rem] leading-relaxed text-muted">
              Fastest path to a match —{" "}
              <Link href="/startup/demo-call" className="font-medium text-forest">
                book the demo call →
              </Link>
            </p>
          </GlassPanel>
        </Reveal>
      </div>

      {/* post a role */}
      <Reveal delay={0.28}>
        <GlassPanel variant="deep" className="flex flex-col gap-5 p-7">
          <div>
            <span className="kicker">Post a role</span>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-ink">
              Tell us who you need.
            </h2>
          </div>
          <InquiryForm defaultEmail={user?.email ?? undefined} />
        </GlassPanel>
      </Reveal>

      {/* playbook teaser */}
      <Reveal delay={0.34}>
        <GlassPanel variant="dark" specular className="flex flex-wrap items-center justify-between gap-5 p-7">
          <div>
            <span className="kicker text-mint">Playbook</span>
            <p className="mt-2 max-w-[40ch] text-[1.05rem] font-medium leading-relaxed">
              How to pick a builder who actually ships — our short guide for
              founders.
            </p>
          </div>
          <Link
            href="/startup/how-to-pick"
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
