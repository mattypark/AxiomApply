import { createHash } from "node:crypto";
import { hqRoute, PRIVATE_HEADERS, readFilters } from "@/lib/hq-api";

export const dynamic = "force-dynamic";

/**
 * KPIs, charts and funnel for one filter state. The page polls this, so an
 * unchanged answer is a 304 with no body.
 */
export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
  return hqRoute(request, params, async ({ source, url }) => {
    const body = JSON.stringify(await source.stats(readFilters(url.searchParams)));
    const etag = `"${createHash("sha1").update(body).digest("base64url")}"`;
    const headers = { ...PRIVATE_HEADERS, ETag: etag };
    if (request.headers.get("if-none-match") === etag) return new Response(null, { status: 304, headers });
    return new Response(body, { headers: { ...headers, "Content-Type": "application/json" } });
  });
}
