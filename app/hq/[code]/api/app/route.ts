import { hqRoute, json } from "@/lib/hq-api";

export const dynamic = "force-dynamic";

/** One application's answers. Contact details are a separate, logged call. */
export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
  return hqRoute(request, params, async ({ source, url }) => {
    const detail = await source.get(url.searchParams.get("id") ?? "");
    return detail ? json(detail) : json({ error: "Not found" }, { status: 404 });
  });
}
