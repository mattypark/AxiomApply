import type { Metadata } from "next";
import { PreviewFrame } from "@/components/preview/PreviewFrame";
import { ApplicantHome } from "@/components/preview/applicant/ApplicantHome";
import { STATE_OPTIONS, STATUS_OPTIONS, pick } from "@/components/preview/applicant/copy";

// Prototype of the signed-in home after applying. Mock data, no requests.
export const metadata: Metadata = {
  title: "Applicant home prototype",
  robots: { index: false, follow: false },
};

export default async function ApplicantHomePreview({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; state?: string }>;
}) {
  const { status, state } = await searchParams;
  return (
    <PreviewFrame current="home">
      <ApplicantHome
        initialStatus={pick(status, STATUS_OPTIONS, "read")}
        initialState={pick(state, STATE_OPTIONS, "ready")}
      />
    </PreviewFrame>
  );
}
