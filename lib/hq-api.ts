import "server-only";

import { checkHq } from "@/lib/hq-gate";
import { getHqSource } from "@/lib/data/hq";
import { EMPTY_FILTERS, type HqActor, type HqFilters, type HqSource, type HqStatus, type Range, type Side } from "@/lib/data/hq/types";

/**
 * The shared half of every /hq/[code]/api/* handler: the two locks, the
 * no-store headers, and parsing the filters out of a query string without
 * trusting any of it.
 */

export const PRIVATE_HEADERS = {
  "Cache-Control": "private, no-store",
  "Referrer-Policy": "no-referrer",
  "X-Robots-Tag": "noindex, nofollow",
} as const;

export function json(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { ...PRIVATE_HEADERS, "Content-Type": "application/json", ...init.headers },
  });
}

const notFound = () => new Response("Not found", { status: 404, headers: PRIVATE_HEADERS });

/**
 * Runs `handle` only for a signed-in admin holding the right code; anyone
 * else gets the same bare 404 as a page that doesn't exist. Writes also have
 * to come from this site: a cross-site form or fetch can't borrow the
 * session to decide or reveal anything.
 */
export async function hqRoute(
  request: Request,
  params: Promise<{ code: string }>,
  handle: (ctx: { actor: HqActor; source: HqSource; url: URL }) => Promise<Response>,
): Promise<Response> {
  const { code } = await params;
  const actor = await checkHq(code);
  if (!actor) return notFound();

  const url = new URL(request.url);
  if (request.method !== "GET") {
    const origin = request.headers.get("origin");
    if (!origin || origin !== url.origin) return notFound();
  }

  try {
    return await handle({ actor, source: getHqSource(), url });
  } catch (error) {
    console.error("HQ request failed:", error instanceof Error ? error.message : error);
    return json({ error: "We couldn't load that right now." }, { status: 500 });
  }
}

const RANGES: Range[] = ["7", "30", "60", "all"];
const SIDES: (Side | "all")[] = ["all", "intern", "startup", "chapter"];
const STATUSES: (HqStatus | "all")[] = ["all", "new", "read", "accepted", "waitlist", "rejected", "withdrawn"];

function pick<T extends string>(value: string | null, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

function label(value: string | null): string | null {
  const text = value?.trim();
  return text ? text.slice(0, 200) : null;
}

export function readFilters(params: URLSearchParams): HqFilters {
  return {
    range: pick(params.get("range"), RANGES, EMPTY_FILTERS.range),
    side: pick(params.get("side"), SIDES, "all"),
    status: pick(params.get("status"), STATUSES, "all"),
    query: (params.get("q") ?? "").slice(0, 100),
    chapter: label(params.get("chapter")),
    org: label(params.get("org")),
    grade: label(params.get("grade")),
    interest: label(params.get("interest")),
  };
}

/** A JSON body with an `id` string, or null. */
export async function readBody(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = (await request.json()) as unknown;
    return body && typeof body === "object" && typeof (body as { id?: unknown }).id === "string" ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}
