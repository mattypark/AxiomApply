import { hqRoute, json, readFilters } from "@/lib/hq-api";

export const dynamic = "force-dynamic";

/** One page of the list, 25 at a time by default. */
export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
  return hqRoute(request, params, async ({ source, url }) => {
    const offset = Number(url.searchParams.get("offset") ?? 0);
    const size = Number(url.searchParams.get("size") ?? 25);
    const sort = url.searchParams.get("sort") === "oldest-unread" ? "oldest-unread" : "newest";
    const list = await source.list(readFilters(url.searchParams), {
      offset: Number.isFinite(offset) ? offset : 0,
      size: Number.isFinite(size) ? size : 25,
      sort,
    });
    return json(list);
  });
}
