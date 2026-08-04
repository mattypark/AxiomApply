import { GlassPanel } from "@/components/glass/GlassPanel";
import { GlassInput } from "@/components/glass/GlassInput";
import { GlassButton } from "@/components/glass/GlassButton";
import { getAdminSupabase } from "@/lib/supabase/admin";
import {
  addResource,
  addSource,
  runAllSources,
  runSource,
  toggleSource,
} from "@/lib/actions/admin";
import type { Source } from "@/types/database";

export const metadata = { title: "Sources — Admin" };
export const dynamic = "force-dynamic";

export default async function AdminSourcesPage() {
  const supabase = getAdminSupabase();
  const { data } = supabase
    ? await supabase.from("sources").select("*").order("created_at")
    : { data: [] };
  const sources = (data as Source[]) ?? [];

  return (
    <main className="flex flex-col gap-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Ingestion sources
        </h1>
        <form action={runAllSources}>
          <GlassButton tone="forest" type="submit">
            Run all now
          </GlassButton>
        </form>
      </div>

      <section className="flex flex-col gap-3">
        {sources.length === 0 && (
          <GlassPanel className="p-6">
            <p className="text-[0.92rem] text-muted">
              No sources yet — add the Simplify GitHub repo and the Interndock
              tracker below.
            </p>
          </GlassPanel>
        )}
        {sources.map((s) => (
          <GlassPanel key={s.id} className="p-5">
            <div className="flex flex-wrap items-center gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="font-semibold text-ink">{s.name}</span>
                  <span className="chip">{s.adapter}</span>
                  {!s.active && <span className="chip text-faint">paused</span>}
                </div>
                <p className="mt-1 truncate font-mono text-[0.72rem] text-muted">{s.url}</p>
                <p className="mt-1 font-mono text-[0.72rem] text-muted">
                  {s.last_run_at
                    ? `last run ${new Date(s.last_run_at).toLocaleString()} · ${s.last_status ?? "?"} · ${s.last_count ?? 0} listings`
                    : "never run"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <form action={runSource}>
                  <input type="hidden" name="id" value={s.id} />
                  <GlassButton tone="glass" type="submit" className="!px-4 !py-2 text-[0.82rem]">
                    Run now
                  </GlassButton>
                </form>
                <form action={toggleSource}>
                  <input type="hidden" name="id" value={s.id} />
                  <input type="hidden" name="active" value={String(s.active)} />
                  <button
                    type="submit"
                    className="text-[0.82rem] text-muted transition-colors hover:text-ink"
                  >
                    {s.active ? "Pause" : "Resume"}
                  </button>
                </form>
              </div>
            </div>
          </GlassPanel>
        ))}
      </section>

      <GlassPanel variant="deep" className="flex flex-col gap-4 p-6">
        <span className="kicker">Add source</span>
        <form action={addSource} className="flex flex-col gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <GlassInput name="name" placeholder="Name (e.g. Simplify Summer 2027)" required />
            <select
              name="adapter"
              required
              defaultValue=""
              className="w-full appearance-none rounded-2xl bg-white/50 px-5 py-3.5 text-[0.95rem] text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] outline-none focus:shadow-[0_0_0_2px_rgba(47,107,61,0.45)]"
            >
              <option value="" disabled>
                Adapter…
              </option>
              <option value="simplify_github">simplify_github (GitHub listings JSON)</option>
              <option value="interndock_html">interndock_html (HTML tracker page)</option>
              <option value="generic_json">generic_json (any JSON feed)</option>
            </select>
          </div>
          <GlassInput name="url" type="url" placeholder="https://…" required />
          <GlassInput
            name="config"
            placeholder='Config JSON (optional) — e.g. {"season":"summer","year":2027}'
          />
          <GlassButton tone="forest" type="submit" className="self-start">
            Add source
          </GlassButton>
        </form>
      </GlassPanel>

      <GlassPanel variant="deep" className="flex flex-col gap-4 p-6">
        <span className="kicker">Add resource (websites · repos · guides · videos)</span>
        <form action={addResource} className="flex flex-col gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <GlassInput name="title" placeholder="Title" required />
            <select
              name="kind"
              required
              defaultValue=""
              className="w-full appearance-none rounded-2xl bg-white/50 px-5 py-3.5 text-[0.95rem] text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] outline-none focus:shadow-[0_0_0_2px_rgba(47,107,61,0.45)]"
            >
              <option value="" disabled>
                Kind…
              </option>
              <option value="website">website</option>
              <option value="github_repo">github_repo</option>
              <option value="guide">guide</option>
              <option value="video">video</option>
            </select>
          </div>
          <GlassInput name="url" type="url" placeholder="https://…" required />
          <GlassInput name="description" placeholder="One-line description (optional)" />
          <GlassButton tone="forest" type="submit" className="self-start">
            Add resource
          </GlassButton>
        </form>
      </GlassPanel>
    </main>
  );
}
