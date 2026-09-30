import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SubmittedMessage } from "@/components/home/SubmittedMessage";
import { getMyApplication } from "@/lib/applications";
import { getMyChapter } from "@/lib/chapters";
import { getUser } from "@/lib/auth";

/**
 * Home, for now (Matthew, 2026-09-29): no workspace. Someone who has applied
 * sees that it went through and when they'll hear back; anyone who hasn't is
 * sent to the application. The old workspace (components/intern/HomeDashboard)
 * is kept in the repo for when it comes back.
 */

export const metadata: Metadata = { title: "Application submitted" };
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getUser();
  // An explicit side, so /onboarding shows the form rather than routing by role.
  if (!user?.email) redirect("/onboarding?side=intern");

  const [application, chapter] = await Promise.all([getMyApplication(), getMyChapter()]);
  if (application) {
    return (
      <SubmittedMessage
        side="intern"
        submittedAt={application.submitted_at}
        name={application.name}
        email={user.email}
        open={application.status === "applied"}
      />
    );
  }
  if (chapter) {
    return (
      <SubmittedMessage
        side="chapter"
        submittedAt={chapter.submitted_at}
        name={chapter.name}
        email={user.email}
        open={chapter.status === "applied" || chapter.status === "review"}
      />
    );
  }
  redirect("/onboarding?side=intern");
}
