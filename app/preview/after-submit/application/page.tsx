import type { Metadata } from "next";
import { PreviewFrame } from "@/components/preview/PreviewFrame";
import { ApplicationView } from "@/components/preview/applicant/ApplicationView";
import { STATUS_OPTIONS, pick } from "@/components/preview/applicant/copy";

// Prototype of "your application" with edit-after-submit. Nothing is saved.
export const metadata: Metadata = {
  title: "Your application prototype",
  robots: { index: false, follow: false },
};

export default async function ApplicationPreview({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  return (
    <PreviewFrame current="application">
      <ApplicationView initialStatus={pick(status, STATUS_OPTIONS, "received")} />
    </PreviewFrame>
  );
}
