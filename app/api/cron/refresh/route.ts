import { NextResponse } from "next/server";
import { runIngestion } from "@/lib/ingest/run";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Vercel Cron target (see vercel.json). Vercel sends
 * `Authorization: Bearer ${CRON_SECRET}` automatically when the env is set.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 503 });
  }
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const results = await runIngestion();
  const status = results.some((r) => r.status === "error") ? 207 : 200;
  return NextResponse.json(
    {
      ran_at: new Date().toISOString(),
      sources: results,
      total: results.reduce((n, r) => n + r.count, 0),
    },
    { status },
  );
}
