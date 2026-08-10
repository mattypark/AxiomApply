import { Sidebar } from "@/components/intern/Sidebar";
import { TabBar } from "@/components/intern/TabBar";
import { getMyApplicationStatus } from "@/lib/applications";
import { getProfile, getUser } from "@/lib/auth";
import { claimInternRole } from "@/lib/actions/profile";

// Intern-side shell: the site header up top (menu pill + profile icon, same
// hide-on-scroll behaviour as the welcome page) and the floating glass dock
// at the bottom. The dock needs the viewer's application status so the Apply
// tab can read "Pending" instead.
export default async function InternLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [applicationStatus, user] = await Promise.all([
    getMyApplicationStatus(),
    getUser(),
  ]);

  const profile = user ? await getProfile() : null;

  // A signed-in visitor with no role used to be bounced to the picker, which
  // made Home on the welcome screen a round trip back to "which side are you
  // on?" — a question they had already answered or deliberately skipped.
  //
  // Reaching /home IS the answer: this is the intern side. Record it and let
  // them through. Anyone who actually wants the startup side still gets there
  // through the picker, and that side keeps its own approval gate.
  if (user && !profile?.role) {
    await claimInternRole(user.id);
  }

  return (
    <div className="min-h-dvh">

      <Sidebar
        displayName={
          profile?.display_name && !profile.display_name.includes("@")
            ? profile.display_name
            : null
        }
        email={user?.email ?? null}
        avatarUrl={profile?.avatar_url ?? null}
        applicationStatus={applicationStatus}
      />

      {/* Offset matches the rail's collapsed / expanded widths. */}
      <div className="px-5 pt-10 pb-36 sm:px-8 md:pl-[92px] xl:pl-[272px]">
        <div className="mx-auto w-full max-w-[1180px]">{children}</div>
      </div>

      {/* The dock stays for phones, where the rail is hidden. */}
      <div className="md:hidden">
        <TabBar applicationStatus={applicationStatus} />
      </div>
    </div>
  );
}
