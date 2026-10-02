import { hqRoute, json } from "@/lib/hq-api";
import { getOutreachSource } from "@/lib/data/outreach";
import { parseUpdate } from "@/lib/data/outreach/logic";

export const dynamic = "force-dynamic";

/**
 * The outreach desk's data. GET lists light rows, or one full row with
 * ?slug=. POST changes status, note or the send-to address for some slugs.
 * Both behind HQ's two locks; POST also has to come from this site.
 */
export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
  return hqRoute(request, params, async ({ url }) => {
    const source = getOutreachSource();
    const slug = url.searchParams.get("slug");
    if (slug === null) return json(await source.list());
    if (!/^[a-z0-9-]{1,120}$/.test(slug)) return json({ error: "Bad request" }, { status: 400 });
    const row = await source.get(slug);
    return row ? json(row) : json({ error: "Not found" }, { status: 404 });
  });
}

export async function POST(request: Request, { params }: { params: Promise<{ code: string }> }) {
  return hqRoute(request, params, async ({ actor }) => {
    const parsed = parseUpdate(await request.json().catch(() => null));
    if (!parsed.ok) return json({ ok: false, error: parsed.error }, { status: 400 });
    const saved = await getOutreachSource().update(parsed.slugs, parsed.patch, actor);
    return json(saved, { status: saved.ok ? 200 : 500 });
  });
}
