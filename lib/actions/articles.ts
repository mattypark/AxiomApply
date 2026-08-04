"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { getAdminSupabase } from "@/lib/supabase/admin";

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

async function adminClientOrThrow() {
  const gate = await requireAdmin();
  if (!gate.ok) throw new Error("Not authorized");
  const supabase = getAdminSupabase();
  if (!supabase) throw new Error("Supabase service role not configured");
  return { supabase, profileId: gate.profile.id };
}

export async function createArticle() {
  const { supabase, profileId } = await adminClientOrThrow();
  const { data, error } = await supabase
    .from("articles")
    .insert({
      title: "Untitled",
      slug: `untitled-${Date.now().toString(36)}`,
      author_id: profileId,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  redirect(`/admin/articles/${data.id}`);
}

/** Autosave target — called (debounced) from the editor. */
export async function saveArticle(formData: FormData) {
  const { supabase } = await adminClientOrThrow();

  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim() || "Untitled";
  const slugInput = String(formData.get("slug") ?? "").trim();
  const slug = slugify(slugInput || title) || `untitled-${Date.now().toString(36)}`;

  await supabase
    .from("articles")
    .update({
      title,
      slug,
      excerpt: String(formData.get("excerpt") ?? "").trim() || null,
      body_md: String(formData.get("body_md") ?? ""),
      cover_url: String(formData.get("cover_url") ?? "").trim() || null,
      tags: String(formData.get("tags") ?? "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    })
    .eq("id", id);
}

export async function publishArticle(formData: FormData) {
  const { supabase } = await adminClientOrThrow();
  const id = String(formData.get("id") ?? "");
  const publish = String(formData.get("publish") ?? "") === "true";

  await supabase
    .from("articles")
    .update({
      published: publish,
      published_at: publish ? new Date().toISOString() : null,
    })
    .eq("id", id);

  revalidatePath("/articles");
  revalidatePath("/home");
  revalidatePath("/admin/articles");
}

export async function deleteArticle(formData: FormData) {
  const { supabase } = await adminClientOrThrow();
  const id = String(formData.get("id") ?? "");
  await supabase.from("articles").delete().eq("id", id);
  revalidatePath("/articles");
  revalidatePath("/admin/articles");
  redirect("/admin/articles");
}
