import { redirect } from "next/navigation";
import { Sidebar } from "@/components/intern/Sidebar";
import { TabBar } from "@/components/intern/TabBar";
import { getMyApplicationStatus } from "@/lib/applications";
import { getProfile, getUser } from "@/lib/auth";

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

  // Signed in but never picked a side → back to onboarding. Skip sets the
  // role, so skipping counts as done; anonymous browsing stays open.
  if (user && !profile?.role) redirect("/onboarding");

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
