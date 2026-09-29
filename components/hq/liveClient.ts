import type { HqClient, HqFilters, HqStats } from "@/lib/data/hq/types";

/**
 * HQ's calls, over fetch, to the gated routes under /hq/<code>/api. Nothing
 * is cached: every response is private and no-store, and stats carry an
 * ETag so an unchanged poll comes back as an empty 304.
 */

function query(filters: HqFilters, extra: Record<string, string | number> = {}): string {
  const params = new URLSearchParams();
  params.set("range", filters.range);
  if (filters.side !== "all") params.set("side", filters.side);
  if (filters.status !== "all") params.set("status", filters.status);
  if (filters.query.trim()) params.set("q", filters.query.trim());
  for (const key of ["chapter", "org", "grade", "interest"] as const) {
    const value = filters[key];
    if (value) params.set(key, value);
  }
  for (const [key, value] of Object.entries(extra)) params.set(key, String(value));
  return params.toString();
}

async function ok(response: Response): Promise<Response> {
  if (!response.ok) throw new Error(`HQ ${response.status}`);
  return response;
}

export function liveHqClient(code: string): HqClient {
  const base = `/hq/${encodeURIComponent(code)}/api`;
  const get = (path: string) => fetch(`${base}/${path}`, { cache: "no-store", credentials: "same-origin" });
  const post = (path: string, body: unknown) =>
    fetch(`${base}/${path}`, {
      method: "POST",
      cache: "no-store",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

  // The last stats body per query, for If-None-Match.
  const lastStats = new Map<string, { etag: string; body: HqStats }>();

  return {
    async stats(filters) {
      const q = query(filters);
      const cached = lastStats.get(q);
      const response = await fetch(`${base}/stats?${q}`, {
        cache: "no-store",
        credentials: "same-origin",
        headers: cached ? { "If-None-Match": cached.etag } : {},
      });
      if (response.status === 304 && cached) return cached.body;
      const body = (await (await ok(response)).json()) as HqStats;
      const etag = response.headers.get("ETag");
      if (etag) lastStats.set(q, { etag, body });
      return body;
    },
    async list(filters, page) {
      return (await ok(await get(`list?${query(filters, page)}`))).json();
    },
    async get(id) {
      const response = await get(`app?id=${encodeURIComponent(id)}`);
      return response.status === 404 ? null : (await ok(response)).json();
    },
    async contact(id) {
      const response = await post("contact", { id });
      return response.ok ? response.json() : null;
    },
    async decide(id, status) {
      return (await post("decide", { id, status })).json();
    },
    async markRead(id) {
      return (await post("read", { id })).json();
    },
    async exportCsv(filters) {
      return (await ok(await get(`export?${query(filters)}`))).text();
    },
  };
}
