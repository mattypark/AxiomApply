import type { Metadata } from "next";
import { SubmittedMessage } from "@/components/home/SubmittedMessage";
import { PreviewBadge } from "@/components/preview/PreviewFrame";

// What /home shows after applying, on mock data. `?open=0` shows the decided version.
export const metadata: Metadata = {
  title: "Submitted prototype",
  robots: { index: false, follow: false },
};

export default async function SubmittedPreviewPage({ searchParams }: { searchParams: Promise<{ open?: string }> }) {
  const { open } = await searchParams;
  return (
    <>
      <SubmittedMessage side="intern" submittedAt="2026-09-28T17:00:00.000Z" name="Test Applicant" email="test@example.com" open={open !== "0"} />
      <PreviewBadge />
    </>
  );
}
