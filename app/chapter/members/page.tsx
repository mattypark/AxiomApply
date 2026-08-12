import Link from "next/link";
import { GlassPanel } from "@/components/glass/GlassPanel";
import { Reveal } from "@/components/motion/Reveal";
import { getMyChapter } from "@/lib/chapters";

export const metadata = { title: "Members" };

/**
 * Members.
 *
 * There is no roster yet — member sign-ups are not built. This page says that
 * plainly rather than rendering an empty table that reads as a bug, and gives
 * the chapter lead something to do in the meantime.
 */
export default async function ChapterMembersPage() {
  const chapter = await getMyChapter();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 py-6">
      <div>
        <Reveal>
          <span className="kicker">Members</span>
        </Reveal>
        <Reveal delay={0.06}>
          <h1 className="mt-2 text-[clamp(1.9rem,5vw,3rem)] font-semibold tracking-tight text-ink">
            Not built yet.
          </h1>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mt-2 max-w-[54ch] text-muted">
            Member sign-ups, attendance and a roster for{" "}
            {chapter?.school ?? "your chapter"} are coming. Until they land,
            keep the list wherever you already keep things — a sheet is fine —
            and do not wait on us to start meeting.
          </p>
        </Reveal>
      </div>

      <Reveal delay={0.18}>
        <GlassPanel variant="deep" className="flex flex-col gap-4 p-7">
          <span className="kicker">What is coming</span>
          <ul className="flex flex-col gap-3 text-[0.95rem] leading-relaxed text-muted">
            <li>A sign-up link you can hand out at a club fair.</li>
            <li>Attendance per meeting, so you can see the drop-off early.</li>
            <li>
              Members who want a placement flowing straight into the intern
              application, with your chapter attached.
            </li>
          </ul>
          <p className="text-[0.85rem] text-faint">
            Want one of these sooner than the others?{" "}
            <a
              href="mailto:matthew@axiompathways.org?subject=Chapter%20roster"
              className="font-medium text-forest hover:text-forest-deep"
            >
              Say which
            </a>
            .
          </p>
        </GlassPanel>
      </Reveal>

      <p className="text-[0.85rem] text-muted">
        Back to{" "}
        <Link href="/chapter/home" className="font-medium text-forest">
          Chapter HQ →
        </Link>
      </p>
    </main>
  );
}
