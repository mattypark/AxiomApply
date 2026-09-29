import { hqRoute, json, readBody } from "@/lib/hq-api";

export const dynamic = "force-dynamic";

/** "Mark read": the only thing besides the Sheet's reviewer column that makes an application read. */
export async function POST(request: Request, { params }: { params: Promise<{ code: string }> }) {
  return hqRoute(request, params, async ({ source, actor }) => {
    const body = await readBody(request);
    if (!body) return json({ error: "Bad request" }, { status: 400 });
    const result = await source.markRead(String(body.id), actor);
    return json(result, { status: result.ok ? 200 : 409 });
  });
}
