import { hqRoute, PRIVATE_HEADERS, readFilters } from "@/lib/hq-api";

export const dynamic = "force-dynamic";

/** The current slice as CSV, phone numbers included. Logged before it's sent. */
export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
  return hqRoute(request, params, async ({ source, actor, url }) => {
    const csv = await source.exportCsv(readFilters(url.searchParams), actor);
    const date = new Date().toISOString().slice(0, 10);
    return new Response(csv, {
      headers: {
        ...PRIVATE_HEADERS,
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="axiom-applications-${date}.csv"`,
      },
    });
  });
}
