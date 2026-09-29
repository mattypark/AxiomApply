import type { Metadata } from "next";
import { gateHq } from "@/lib/hq-gate";
import { HqFrame } from "@/components/hq/HqFrame";
import { HqLive } from "@/components/hq/HqLive";

/**
 * HQ, live. Both locks run before anything renders: a signed-in admin, then
 * the secret code. Either failure is the site's ordinary 404. The data comes
 * after, from the gated routes beside this page, which check both again.
 *
 * Headers (next.config.ts): private, no-store; no-referrer; noindex.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "HQ",
  robots: { index: false, follow: false, nocache: true },
  referrer: "no-referrer",
};

export default async function HqPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const actor = await gateHq(code);
  return (
    <HqFrame>
      <HqLive code={code} viewer={actor.name} />
    </HqFrame>
  );
}
