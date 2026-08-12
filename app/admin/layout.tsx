import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Admin" };

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const gate = await requireAdmin();
  if (!gate.ok) redirect("/");

  return (
    <div className="mx-auto min-h-dvh w-full max-w-4xl px-5 pb-20 sm:px-8">
      <header className="flex items-center justify-between py-6">
        <span className="kicker">Axiom admin</span>
        <nav className="flex items-center gap-5 text-[0.9rem]">
          <Link
            href="/admin/applications"
            className="text-muted transition-colors hover:text-ink"
          >
            Decisions
          </Link>
          <Link
            href="/admin/chapters"
            className="text-muted transition-colors hover:text-ink"
          >
            Chapters
          </Link>
          <Link href="/admin/sources" className="text-muted transition-colors hover:text-ink">
            Sources
          </Link>
          <Link href="/admin/articles" className="text-muted transition-colors hover:text-ink">
            Articles
          </Link>
          <Link href="/home" className="text-muted transition-colors hover:text-ink">
            ← Site
          </Link>
        </nav>
      </header>
      {children}
    </div>
  );
}
