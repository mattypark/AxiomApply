import { GlassPanel } from "@/components/glass/GlassPanel";
import { GlassButton } from "@/components/glass/GlassButton";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { setChapterStatus } from "@/lib/actions/chapters";

export const metadata = { title: "Chapters — Admin" };
export const dynamic = "force-dynamic";

/**
 * Chapter review queue.
 *
 * Startup inquiries are worked in their spreadsheet and have no page here, but
 * chapters need one: approval is what unlocks Chapter HQ, and that flag lives
 * in Postgres. The Sheet stays the place to read the long answers — this page
 * is the decision.
 */

type Row = {
  id: string;
  status: string;
  name: string | null;
  email: string;
  school: string | null;
  city: string | null;
  grade: string | null;
  advisor_status: string | null;
  hours: string | null;
  how_long: string | null;
  cadence: string | null;
  qualified: string | null;
  why_axiom: string | null;
  biggest_risk: string | null;
  submitted_at: string;
};

const NEXT_ACTIONS: { status: string; label: string; tone: "forest" | undefined }[] =
  [
    { status: "approved", label: "Approve", tone: "forest" },
    { status: "review", label: "Mark reading", tone: undefined },
    { status: "rejected", label: "Reject", tone: undefined },
  ];

export default async function AdminChaptersPage() {
  const supabase = getAdminSupabase();
  const { data } = supabase
    ? await supabase
        .from("chapter_applications")
        .select(
          "id, status, name, email, school, city, grade, advisor_status, hours, how_long, cadence, qualified, why_axiom, biggest_risk, submitted_at",
        )
        .order("submitted_at", { ascending: false })
    : { data: [] };

  const rows = (data as Row[] | null) ?? [];

  return (
    <main className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Chapter applications
        </h1>
        <p className="mt-2 text-[0.92rem] text-muted">
          Approving one unlocks Chapter HQ for that person immediately. The full
          answers are in the chapters spreadsheet.
        </p>
      </div>

      {rows.length === 0 && (
        <GlassPanel className="p-6">
          <p className="text-[0.92rem] text-muted">
            No chapter applications yet — or the 0017 migration has not been run
            on this database.
          </p>
        </GlassPanel>
      )}

      <section className="flex flex-col gap-4">
        {rows.map((row) => (
          <GlassPanel key={row.id} className="flex flex-col gap-4 p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <div>
                <h2 className="text-[1.1rem] font-semibold tracking-tight text-ink">
                  {row.school ?? "School not given"}
                </h2>
                <p className="mt-1 text-[0.88rem] text-muted">
                  {row.name ?? "—"} · {row.email}
                  {row.grade ? ` · ${row.grade}` : ""}
                  {row.city ? ` · ${row.city}` : ""}
                </p>
              </div>
              <span className="chip chip-forest">{row.status}</span>
            </div>

            <dl className="grid gap-3 text-[0.85rem] sm:grid-cols-3">
              <div>
                <dt className="font-mono text-[0.62rem] tracking-[0.16em] text-faint uppercase">
                  Advisor
                </dt>
                <dd className="mt-1 text-muted">{row.advisor_status ?? "—"}</dd>
              </div>
              <div>
                <dt className="font-mono text-[0.62rem] tracking-[0.16em] text-faint uppercase">
                  Hours / term
                </dt>
                <dd className="mt-1 text-muted">
                  {row.hours ?? "—"} · {row.how_long ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[0.62rem] tracking-[0.16em] text-faint uppercase">
                  Cadence
                </dt>
                <dd className="mt-1 text-muted">{row.cadence ?? "—"}</dd>
              </div>
            </dl>

            {row.qualified && (
              <p className="text-[0.88rem] leading-relaxed text-muted">
                <span className="font-medium text-ink">Why them: </span>
                {row.qualified}
              </p>
            )}
            {row.why_axiom && (
              <p className="text-[0.88rem] leading-relaxed text-muted">
                <span className="font-medium text-ink">Why Axiom: </span>
                {row.why_axiom}
              </p>
            )}
            {row.biggest_risk && (
              <p className="text-[0.88rem] leading-relaxed text-muted">
                <span className="font-medium text-ink">Biggest risk: </span>
                {row.biggest_risk}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2">
              {NEXT_ACTIONS.filter((action) => action.status !== row.status).map(
                (action) => (
                  <form key={action.status} action={setChapterStatus}>
                    <input type="hidden" name="id" value={row.id} />
                    <input type="hidden" name="status" value={action.status} />
                    <GlassButton tone={action.tone} type="submit">
                      {action.label}
                    </GlassButton>
                  </form>
                ),
              )}
              <span className="ml-auto font-mono text-[0.68rem] tracking-[0.14em] text-faint uppercase">
                {new Date(row.submitted_at).toLocaleDateString()}
              </span>
            </div>
          </GlassPanel>
        ))}
      </section>
    </main>
  );
}
