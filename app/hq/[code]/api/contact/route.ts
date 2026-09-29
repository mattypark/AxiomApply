import { hqRoute, json, readBody } from "@/lib/hq-api";

export const dynamic = "force-dynamic";

/** Email and phone behind "Show". A POST because every reveal is written to hq_audit. */
export async function POST(request: Request, { params }: { params: Promise<{ code: string }> }) {
  return hqRoute(request, params, async ({ source, actor }) => {
    const body = await readBody(request);
    if (!body) return json({ error: "Bad request" }, { status: 400 });
    const contact = await source.contact(String(body.id), actor);
    return contact ? json(contact) : json({ error: "Couldn't show that right now." }, { status: 404 });
  });
}
