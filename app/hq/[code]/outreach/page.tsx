import type { Metadata } from "next";
import { gateHq } from "@/lib/hq-gate";
import { HqFrame } from "@/components/hq/HqFrame";
import { OutreachLive } from "@/components/hq/outreach/OutreachLive";

/**
 * HQ's YC outreach desk. Same two locks as HQ: a signed-in admin, then the
 * secret code; either failure is the ordinary 404. The data comes from the
 * gated route beside it, which checks both again.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "YC outreach · HQ",
  robots: { index: false, follow: false, nocache: true },
  referrer: "no-referrer",
};

export default async function OutreachPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  await gateHq(code);
  return (
    <HqFrame code={code} current="outreach">
      <OutreachLive code={code} />
    </HqFrame>
  );
}
