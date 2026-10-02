import type { Metadata } from "next";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { notFound } from "next/navigation";
import { HqFrame } from "@/components/hq/HqFrame";
import { OutreachPreview } from "@/components/preview/hq/OutreachPreview";
import type { OutreachRow } from "@/lib/data/outreach/types";

/**
 * The live outreach desk's components over a local bundle, for checking the
 * UI without signing in. Development only: the bundle holds founders' names
 * and addresses, so in production this route doesn't exist.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Outreach prototype",
  robots: { index: false, follow: false },
};

const BUNDLE = join(process.cwd(), "private", "outreach", "hq-bundle.json");

export default async function OutreachPreviewPage() {
  if (process.env.NODE_ENV === "production") notFound();
  let rows: OutreachRow[] = [];
  try {
    const bundle = JSON.parse(await readFile(BUNDLE, "utf8")) as { rows: (Omit<OutreachRow, "updatedAt" | "updatedBy" | "company"> & { company: Record<string, unknown> })[] };
    rows = bundle.rows.map((row) => ({
      ...row,
      company: { ...row.company, jobCount: Array.isArray(row.company.jobs) ? row.company.jobs.length : 0 } as unknown as OutreachRow["company"],
      updatedAt: null,
      updatedBy: null,
    }));
  } catch {
    // No bundle: the desk shows its "no data yet" state.
  }
  return (
    <HqFrame>
      <OutreachPreview rows={rows} />
    </HqFrame>
  );
}
