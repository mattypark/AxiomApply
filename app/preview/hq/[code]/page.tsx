import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PreviewFrame } from "@/components/preview/PreviewFrame";
import { HqPreview } from "@/components/preview/hq/HqPreview";
import { MOCK_HQ_CODE } from "@/components/preview/hq/secret";

/**
 * The secret-path pattern, mocked: any code but the right one is an ordinary
 * 404 — the same page a typo gets, so a wrong guess learns nothing. In the
 * real route this check runs after the sign-in gate, not instead of it.
 */
export const metadata: Metadata = {
  title: "HQ prototype",
  robots: { index: false, follow: false },
};

export default async function HqSecretPreviewPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  if (code !== MOCK_HQ_CODE) notFound();
  return (
    <PreviewFrame current="hq" ground={false}>
      <HqPreview initialState="ready" where={`/preview/hq/${MOCK_HQ_CODE}`} />
    </PreviewFrame>
  );
}
