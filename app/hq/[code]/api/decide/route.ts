import { hqRoute, json, readBody } from "@/lib/hq-api";
import type { HqDecision } from "@/lib/data/hq/types";

export const dynamic = "force-dynamic";

const DECISIONS: HqDecision[] = ["accepted", "waitlist", "rejected"];

/** Records a decision. Never sends mail: that stays with the Decisions desk. */
export async function POST(request: Request, { params }: { params: Promise<{ code: string }> }) {
  return hqRoute(request, params, async ({ source, actor }) => {
    const body = await readBody(request);
    const status = body?.status as HqDecision;
    if (!body || !DECISIONS.includes(status)) return json({ error: "Bad request" }, { status: 400 });
    const result = await source.decide(String(body.id), status, actor);
    return json(result, { status: result.ok ? 200 : 409 });
  });
}
