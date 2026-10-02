import type { OutreachClient, OutreachList, OutreachRow, OutreachSaved } from "@/lib/data/outreach/types";

/** The outreach desk's calls, over fetch, to the gated /hq/<code>/api/outreach route. Nothing cached. */
export function liveOutreachClient(code: string): OutreachClient {
  const base = `/hq/${encodeURIComponent(code)}/api/outreach`;
  const options: RequestInit = { cache: "no-store", credentials: "same-origin" };

  return {
    async list() {
      const response = await fetch(base, options);
      if (!response.ok) throw new Error(`HQ ${response.status}`);
      return (await response.json()) as OutreachList;
    },
    async get(slug) {
      const response = await fetch(`${base}?slug=${encodeURIComponent(slug)}`, options);
      if (response.status === 404) return null;
      if (!response.ok) throw new Error(`HQ ${response.status}`);
      return (await response.json()) as OutreachRow;
    },
    async update(slugs, patch) {
      const response = await fetch(base, {
        ...options,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slugs, patch }),
      });
      return (await response.json().catch(() => ({ ok: false, error: "That didn't save. Try again." }))) as OutreachSaved;
    },
  };
}
