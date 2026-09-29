import type { Metadata } from "next";
import { PreviewFrame } from "@/components/preview/PreviewFrame";
import { HqPreview } from "@/components/preview/hq/HqPreview";
import type { MockMode } from "@/components/preview/hq/mockClient";

// The live HQ dashboard's own components over mock rows. No requests, nothing
// links here, and search engines are told to stay out.
export const metadata: Metadata = {
  title: "HQ prototype",
  robots: { index: false, follow: false },
};

const STATES: MockMode[] = ["ready", "loading", "error", "empty"];

export default async function HqPreviewPage({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
  const { state } = await searchParams;
  const initial = STATES.find((value) => value === state) ?? "ready";
  return (
    <PreviewFrame current="hq" ground={false}>
      <HqPreview initialState={initial} where="/hq/<long-random-code> · sign-in required" />
    </PreviewFrame>
  );
}
