import Link from "next/link";
import { GlassPanel } from "@/components/glass/GlassPanel";
import { GlassInput, GlassTextarea } from "@/components/glass/GlassInput";
import { GlassButton } from "@/components/glass/GlassButton";
import { Reveal } from "@/components/motion/Reveal";
import { getProfile } from "@/lib/auth";
import { getMyApplication } from "@/lib/applications";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { getServerSupabase } from "@/lib/supabase/server";
import { signOut, updateProfile } from "@/lib/actions/profile";
import { SEASONS, FIELDS, type Internship } from "@/types/database";

export const metadata = { title: "Account" };

const GRADES = [
  "9th grade",
  "10th grade",
  "11th grade",
  "12th grade",
  "College — Freshman",
  "College — Sophomore",
  "College — Junior",
  "College — Senior",
  "Other",
];

export default async function AccountPage() {
  if (!hasSupabaseEnv) {
    return (
      <Shell>
        <GlassPanel className="p-8">
          <p className="text-muted">
            Accounts switch on once Supabase is configured (see SETUP.md).
            Browsing, learning, and applying all work without one.
          </p>
        </GlassPanel>
      </Shell>
    );
  }

  const profile = await getProfile();
  if (!profile) {
    return (
      <Shell>
        <GlassPanel specular className="flex flex-col items-start gap-4 p-8">
          <h2 className="text-xl font-semibold tracking-tight text-ink">
            You&apos;re browsing signed out.
          </h2>
          <p className="max-w-[46ch] text-[0.95rem] text-muted">
            Sign in to save internships, set season and field preferences, and
            prefill your application.
          </p>
          <GlassButton tone="forest" href="/auth?next=/account">
            Sign in →
          </GlassButton>
        </GlassPanel>
      </Shell>
    );
  }

  // Everything this person already told us in their application. It fills the
  // blanks in the form below — shown, never written behind their back, and
  // never on top of something they typed themselves.
  const application = await getMyApplication();

  const borrowed: string[] = [];

  /** Profile value if the user has one, otherwise the application's answer. */
  const pick = (
    label: string,
    own: string | null,
    fromApplication: string | null | undefined,
  ): string => {
    if (own?.trim()) return own.trim();
    const borrowedValue = fromApplication?.trim();
    if (!borrowedValue) return "";
    borrowed.push(label);
    return borrowedValue;
  };

  const filled = {
    // display_name is seeded with the email address at signup, so an address
    // counts as empty here — otherwise the real name never gets a chance.
    display_name: pick("name", realName(profile.display_name), application?.name),
    phone: pick("phone", profile.phone, application?.phone),
    school: pick("school", profile.school, application?.school),
    grade: pick("grade", profile.grade, application?.grade),
    experience: pick("experience", profile.experience, application?.startup_role),
    github: pick("GitHub", profile.github, application?.github),
    linkedin: pick("LinkedIn", profile.linkedin, application?.linkedin),
    social: pick("socials", profile.social, application?.instagram),
  };

  // `interest` is one field on the application; preferred_fields is a set.
  // Seed the set from it only when the user has not chosen any fields yet.
  const seededFields = FIELDS.filter((f) => f === application?.interest);
  const preferredFields =
    profile.preferred_fields.length > 0 ? profile.preferred_fields : seededFields;
  if (profile.preferred_fields.length === 0 && seededFields.length > 0) {
    borrowed.push("fields");
  }

  // Saved internships (empty until the feed ships saves)
  const supabase = await getServerSupabase();
  let saved: Internship[] = [];
  if (supabase) {
    const { data } = await supabase
      .from("saved_internships")
      .select("internship:internships(*)")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false });
    saved =
      (data
        ?.map((r) => r.internship as unknown as Internship)
        .filter(Boolean) as Internship[]) ?? [];
  }

  return (
    <Shell>
      {borrowed.length > 0 && (
        <GlassPanel specular className="flex flex-col gap-1 p-5">
          <p className="text-[0.92rem] text-ink">
            Filled in from your application — {listOf(borrowed)}.
          </p>
          <p className="text-[0.85rem] text-muted">
            Nothing is saved until you hit save. Change anything that&apos;s
            out of date.
          </p>
        </GlassPanel>
      )}

      <form action={updateProfile} className="flex flex-col gap-5">
        <GlassPanel variant="deep" className="flex flex-col gap-5 p-7">
          <span className="kicker">Profile</span>
          <div className="grid gap-4 sm:grid-cols-2">
            <Labeled label="Name">
              <GlassInput
                name="display_name"
                defaultValue={filled.display_name}
                placeholder="Your name"
              />
            </Labeled>
            <Labeled label="Phone">
              <GlassInput
                name="phone"
                type="tel"
                autoComplete="tel"
                defaultValue={filled.phone}
                placeholder="(555) 555-5555"
              />
            </Labeled>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Labeled label="School">
              <GlassInput
                name="school"
                defaultValue={filled.school}
                placeholder="Your school"
              />
            </Labeled>
            <Labeled label="Grade / Year">
              <select
                name="grade"
                defaultValue={filled.grade}
                className="w-full appearance-none rounded-2xl bg-white/50 px-5 py-3.5 text-[0.95rem] text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] outline-none focus:shadow-[0_0_0_2px_rgba(47,107,61,0.45)]"
              >
                <option value="">Select…</option>
                {GRADES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </Labeled>
          </div>
        </GlassPanel>

        <GlassPanel variant="deep" className="flex flex-col gap-5 p-7">
          <span className="kicker">What you&apos;re looking for</span>
          <Labeled label="Seasons">
            <div className="flex flex-wrap gap-2.5">
              {SEASONS.map((s) => (
                <label key={s} className="cursor-pointer">
                  <input
                    type="checkbox"
                    name="preferred_seasons"
                    value={s}
                    defaultChecked={profile.preferred_seasons.includes(s)}
                    className="peer sr-only"
                  />
                  <span className="chip inline-block capitalize transition-colors duration-200 peer-checked:bg-forest peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-forest">
                    {s}
                  </span>
                </label>
              ))}
            </div>
          </Labeled>
          <Labeled label="Fields">
            <div className="flex flex-wrap gap-2.5">
              {FIELDS.map((f) => (
                <label key={f} className="cursor-pointer">
                  <input
                    type="checkbox"
                    name="preferred_fields"
                    value={f}
                    defaultChecked={preferredFields.includes(f)}
                    className="peer sr-only"
                  />
                  <span className="chip inline-block transition-colors duration-200 peer-checked:bg-forest peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-forest">
                    {f}
                  </span>
                </label>
              ))}
            </div>
          </Labeled>
          <Labeled label="Experience">
            <GlassTextarea
              name="experience"
              defaultValue={filled.experience}
              placeholder="What you've built, shipped, or worked on so far…"
            />
          </Labeled>
        </GlassPanel>

        <GlassPanel variant="deep" className="flex flex-col gap-5 p-7">
          <span className="kicker">Your links</span>
          <div className="grid gap-4 sm:grid-cols-2">
            <Labeled label="GitHub">
              <GlassInput
                name="github"
                defaultValue={filled.github}
                placeholder="@username or URL"
              />
            </Labeled>
            <Labeled label="LinkedIn">
              <GlassInput
                name="linkedin"
                defaultValue={filled.linkedin}
                placeholder="profile URL"
              />
            </Labeled>
          </div>
          <Labeled label="Social / portfolio">
            <GlassInput
              name="social"
              defaultValue={filled.social}
              placeholder="Instagram, X, personal site…"
            />
          </Labeled>
        </GlassPanel>

        <div className="flex items-center justify-between gap-4">
          <GlassButton tone="forest" type="submit">
            Save changes
          </GlassButton>
          <div className="flex items-center gap-4">
            <button
              formAction={signOut}
              className="text-[0.9rem] text-muted transition-colors hover:text-error"
            >
              Log out
            </button>
            <span aria-hidden className="h-4 w-px bg-ink/10" />
            <button
              formAction={signOut}
              className="text-[0.9rem] text-muted transition-colors hover:text-error"
            >
              Sign out
            </button>
          </div>
        </div>
      </form>

      <section className="mt-4">
        <span className="kicker">Saved internships</span>
        {saved.length === 0 ? (
          <GlassPanel className="mt-3 p-6">
            <p className="text-[0.92rem] text-muted">
              Nothing saved yet — tap the bookmark on any internship in the{" "}
              <Link href="/internships" className="font-medium text-forest">
                feed →
              </Link>
            </p>
          </GlassPanel>
        ) : (
          <div className="mt-3 flex flex-col gap-3">
            {saved.map((i) => (
              <GlassPanel key={i.id} specular className="p-5">
                <a
                  href={i.url ?? "#"}
                  target="_blank"
                  rel="noopener"
                  className="flex flex-wrap items-baseline justify-between gap-3"
                >
                  <span>
                    <span className="font-semibold text-ink">{i.company}</span>{" "}
                    <span className="text-muted">— {i.role}</span>
                  </span>
                  <span className="chip chip-forest capitalize">
                    {i.season} {i.year ?? ""}
                  </span>
                </a>
              </GlassPanel>
            ))}
          </div>
        )}
      </section>
    </Shell>
  );
}

/** Supabase seeds display_name with the email address; that is not a name. */
function realName(value: string | null): string | null {
  const trimmed = value?.trim();
  if (!trimmed || trimmed.includes("@")) return null;
  return trimmed;
}

/** "a", "a and b", "a, b, and c" */
function listOf(items: string[]): string {
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 py-6">
      <Reveal>
        <h1 className="text-[clamp(1.8rem,4.5vw,2.6rem)] font-semibold tracking-tight text-ink">
          Account
        </h1>
      </Reveal>
      <Reveal delay={0.08}>{children}</Reveal>
    </main>
  );
}

function Labeled({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[0.85rem] font-medium text-ink">{label}</span>
      {children}
    </div>
  );
}
