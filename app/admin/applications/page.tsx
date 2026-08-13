import { GlassPanel } from "@/components/glass/GlassPanel";
import { GlassInput } from "@/components/glass/GlassInput";
import { GlassButton } from "@/components/glass/GlassButton";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { isEmailConfigured } from "@/lib/email/client";
import { BATCH_SIZE, renderDecisionCopy, type QueueTemplate } from "@/lib/email/decision-copy";
import { buildQueue, discardPending, sendNextBatch } from "@/lib/actions/decisions";

export const metadata = { title: "Decisions — Admin" };
export const dynamic = "force-dynamic";

/**
 * The review desk for decision mail.
 *
 * Read the counts, read the copy, then send in batches. Nothing on this page
 * happens on its own: the Sheet push fills `applications`, "Build queue"
 * renders copy into `email_queue` without sending, and each "Send next"
 * click puts exactly one batch on the wire.
 */

const TEMPLATE_LABEL: Record<QueueTemplate, string> = {
  notSelected: "Rejection",
  waitlisted: "Waitlist",
};

type Counts = Record<string, number>;

async function loadCounts() {
  const supabase = getAdminSupabase();
  if (!supabase) return null;

  const { data: apps } = await supabase.from("applications").select("status, email");
  const { data: queue } = await supabase.from("email_queue").select("template, status");
  const { data: samples } = await supabase
    .from("email_queue")
    .select("template, subject, body, status")
    .eq("status", "pending")
    .order("queued_at", { ascending: true })
    .limit(400);

  const byStatus: Counts = {};
  const people = new Set<string>();
  for (const row of apps ?? []) {
    byStatus[row.status as string] = (byStatus[row.status as string] ?? 0) + 1;
    people.add(String(row.email).toLowerCase());
  }

  const queueCounts: Record<string, Counts> = {};
  for (const row of queue ?? []) {
    const template = row.template as string;
    queueCounts[template] ??= {};
    queueCounts[template][row.status as string] =
      (queueCounts[template][row.status as string] ?? 0) + 1;
  }

  const pendingSample: Partial<Record<QueueTemplate, { subject: string; body: string }>> = {};
  for (const row of samples ?? []) {
    const template = row.template as QueueTemplate;
    pendingSample[template] ??= { subject: row.subject as string, body: row.body as string };
  }

  return {
    byStatus,
    uniquePeople: people.size,
    totalRows: (apps ?? []).length,
    queueCounts,
    pendingSample,
  };
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[1.4rem] leading-none text-ink">{value}</span>
      <span className="text-[0.78rem] text-muted">{label}</span>
    </div>
  );
}

function CopyBlock({ subject, body }: { subject: string; body: string }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="font-mono text-[0.78rem] text-muted">Subject: {subject}</p>
      <pre className="overflow-x-auto whitespace-pre-wrap rounded-2xl bg-white/45 p-5 font-mono text-[0.76rem] leading-[1.6] text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
        {body}
      </pre>
    </div>
  );
}

export default async function AdminDecisionsPage() {
  const data = await loadCounts();

  if (!data) {
    return (
      <main className="flex flex-col gap-8">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Decisions</h1>
        <GlassPanel className="p-6">
          <p className="text-[0.92rem] text-muted">
            Supabase service role isn&rsquo;t configured, so there is nothing to read. Set
            SUPABASE_SERVICE_ROLE_KEY and reload.
          </p>
        </GlassPanel>
      </main>
    );
  }

  const { byStatus, uniquePeople, totalRows, queueCounts, pendingSample } = data;
  const rejected = byStatus.rejected ?? 0;
  const undecided = (byStatus.applied ?? 0) + (byStatus.waitlist ?? 0);
  const accepted = byStatus.accepted ?? 0;

  // Defaults for the copy: real numbers, already on screen, so the person
  // filling this in is confirming rather than inventing.
  const facts = {
    applicantCount: String(uniquePeople),
    matchCount: String(accepted),
    season: "",
    nextCycleDate: "",
  };

  const previews = (["notSelected", "waitlisted"] as QueueTemplate[]).map((template) => ({
    template,
    stored: pendingSample[template],
    // Before a queue exists there is nothing stored to show, so the page falls
    // back to rendering the template live — clearly labelled, because the
    // cycle facts aren't filled in yet.
    live: renderDecisionCopy(
      template,
      { ...facts, season: "summer", nextCycleDate: "[date you type below]" },
      "Sam",
    ),
  }));

  return (
    <main className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Decisions</h1>
        {!isEmailConfigured() && (
          <span className="chip text-faint">email not configured — sends will skip</span>
        )}
      </div>

      <GlassPanel className="p-6">
        <span className="kicker">From the Sheet</span>
        <div className="mt-4 grid grid-cols-2 gap-6 sm:grid-cols-5">
          <Stat label="rows" value={totalRows} />
          <Stat label="people" value={uniquePeople} />
          <Stat label="rejected" value={rejected} />
          <Stat label="undecided + waitlist" value={undecided} />
          <Stat label="accepted (not mailed)" value={accepted} />
        </div>
        <p className="mt-5 text-[0.85rem] leading-relaxed text-muted">
          Rejected people get the rejection email. Everyone undecided or waitlisted gets the
          waitlist email. Accepted people get nothing from here — that email needs the startup,
          role and founder, which the Sheet doesn&rsquo;t carry, so you send those yourself.
        </p>
      </GlassPanel>

      <GlassPanel variant="deep" className="flex flex-col gap-4 p-6">
        <span className="kicker">1 · Build the queue</span>
        <p className="text-[0.85rem] leading-relaxed text-muted">
          Renders the copy for {rejected + undecided} people and saves it. Sends nothing. These
          four values appear word for word in the emails.
        </p>
        <form action={buildQueue} className="flex flex-col gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <GlassInput
              name="applicantCount"
              defaultValue={facts.applicantCount}
              placeholder="Applications this round"
              required
            />
            <GlassInput
              name="matchCount"
              defaultValue={facts.matchCount}
              placeholder="Seats matched"
              required
            />
            <GlassInput name="season" placeholder="Season they applied for (e.g. summer)" required />
            <GlassInput
              name="nextCycleDate"
              placeholder="Applications reopen (e.g. January 5)"
              required
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <GlassButton tone="forest" type="submit" className="self-start">
              Build queue
            </GlassButton>
            <span className="text-[0.78rem] text-muted">
              Safe to re-run — anyone already queued or already emailed is left alone.
            </span>
          </div>
        </form>
      </GlassPanel>

      <section className="flex flex-col gap-4">
        <span className="kicker">2 · Read what goes out</span>
        {previews.map(({ template, stored, live }) => {
          const counts = queueCounts[template] ?? {};
          const pending = counts.pending ?? 0;
          const sent = counts.sent ?? 0;
          const skipped = counts.skipped ?? 0;
          const failed = counts.failed ?? 0;
          const batch = Math.min(BATCH_SIZE, pending);

          return (
            <GlassPanel key={template} className="flex flex-col gap-4 p-6">
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="font-semibold text-ink">{TEMPLATE_LABEL[template]}</span>
                <span className="chip">{template}</span>
                <span className="font-mono text-[0.72rem] text-muted">
                  {pending} pending · {sent} sent · {skipped} skipped · {failed} failed
                </span>
              </div>

              {stored ? (
                <CopyBlock subject={stored.subject} body={stored.body} />
              ) : (
                <>
                  <p className="text-[0.78rem] text-muted">
                    Nothing queued yet — this is the template rendered live, with placeholder
                    cycle facts. Build the queue to freeze the real copy.
                  </p>
                  <CopyBlock subject={live.subject} body={live.text} />
                </>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <form action={sendNextBatch}>
                  <input type="hidden" name="template" value={template} />
                  <GlassButton
                    tone={pending ? "forest" : "glass"}
                    type="submit"
                    disabled={!pending}
                  >
                    {pending
                      ? `Send next ${batch} (${pending} pending)`
                      : "Nothing pending"}
                  </GlassButton>
                </form>
                {pending > BATCH_SIZE && (
                  <span className="text-[0.78rem] text-muted">
                    {Math.ceil(pending / BATCH_SIZE)} clicks left. Spread them over days — a
                    single burst from a new sending domain is what gets mail filtered.
                  </span>
                )}
              </div>
            </GlassPanel>
          );
        })}
      </section>

      <GlassPanel className="flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <span className="kicker">Wrong numbers?</span>
          <p className="mt-2 text-[0.85rem] text-muted">
            Deletes every pending row so you can rebuild. Anything already sent stays on the
            record.
          </p>
        </div>
        <form action={discardPending}>
          <GlassButton tone="glass" type="submit">
            Discard pending
          </GlassButton>
        </form>
      </GlassPanel>
    </main>
  );
}
