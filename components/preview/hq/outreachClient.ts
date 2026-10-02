import type { OutreachClient, OutreachRow } from "@/lib/data/outreach/types";

/**
 * The outreach desk over rows held in memory, for /preview/hq/outreach. Edits
 * live until the page reloads; nothing is sent anywhere.
 */
export function memoryOutreachClient(initial: OutreachRow[]): OutreachClient {
  const rows = new Map(initial.map((row) => [row.slug, { ...row }]));
  return {
    async list() {
      return rows.size ? { ok: true, rows: [...rows.values()], importedAt: null } : { ok: false, reason: "not-imported" };
    },
    async get(slug) {
      return rows.get(slug) ?? null;
    },
    async update(slugs, patch) {
      const now = new Date().toISOString();
      const saved = slugs.flatMap((slug) => {
        const row = rows.get(slug);
        if (!row) return [];
        const next = { ...row, ...patch, updatedAt: now, updatedBy: "preview" };
        rows.set(slug, next);
        return [{ slug, status: next.status, note: next.note, contact: next.contact, updatedAt: now, updatedBy: "preview" }];
      });
      return { ok: true, rows: saved };
    },
  };
}
