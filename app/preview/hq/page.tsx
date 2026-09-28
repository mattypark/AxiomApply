import type { Metadata } from "next";
import { PreviewFrame } from "@/components/preview/PreviewFrame";
import { HqDashboard, type HqState } from "@/components/preview/hq/HqDashboard";

// Prototype of the private applicant dashboard. Mock data only, no requests,
// nothing links here, and search engines are told to stay out.
export const metadata: Metadata = {
  title: "HQ prototype",
  robots: { index: false, follow: false },
};

const STATES: HqState[] = ["ready", "loading", "error", "empty"];

export default async function HqPreviewPage({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
  const { state } = await searchParams;
  const initial = STATES.find((value) => value === state) ?? "ready";
  return (
    <PreviewFrame current="hq" ground={false}>
      <HqDashboard initialState={initial} secretPath="/hq/<long-random-code> · sign-in required" />
    </PreviewFrame>
  );
}
