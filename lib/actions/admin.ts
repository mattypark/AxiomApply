"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { runIngestion } from "@/lib/ingest/run";

async function adminClientOrThrow() {
  const gate = await requireAdmin();
  if (!gate.ok) throw new Error("Not authorized");
  const supabase = getAdminSupabase();
  if (!supabase) throw new Error("Supabase service role not configured");
  return supabase;
}

export async function addSource(formData: FormData) {
  const supabase = await adminClientOrThrow();

  const name = String(formData.get("name") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  const adapter = String(formData.get("adapter") ?? "");
  const configRaw = String(formData.get("config") ?? "").trim();

  if (!name || !url) throw new Error("Name and URL required");
  if (!["simplify_github", "interndock_html", "generic_json", "manual"].includes(adapter)) {
    throw new Error("Unknown adapter");
  }

  let config: Record<string, unknown> = {};
  if (configRaw) {
    try {
      config = JSON.parse(configRaw);
    } catch {
      throw new Error("Config must be valid JSON");
    }
  }

  await supabase.from("sources").insert({ name, url, adapter, config });
  revalidatePath("/admin/sources");
}

export async function toggleSource(formData: FormData) {
  const supabase = await adminClientOrThrow();
  const id = String(formData.get("id") ?? "");
  const active = String(formData.get("active") ?? "") === "true";
  await supabase.from("sources").update({ active: !active }).eq("id", id);
  revalidatePath("/admin/sources");
}

export async function runSource(formData: FormData) {
  const gate = await requireAdmin();
  if (!gate.ok) throw new Error("Not authorized");
  const id = String(formData.get("id") ?? "");
  await runIngestion(id || undefined);
  revalidatePath("/admin/sources");
  revalidatePath("/internships");
}

export async function runAllSources() {
  const gate = await requireAdmin();
  if (!gate.ok) throw new Error("Not authorized");
  await runIngestion();
  revalidatePath("/admin/sources");
  revalidatePath("/internships");
}

export async function addResource(formData: FormData) {
  const supabase = await adminClientOrThrow();

  const kind = String(formData.get("kind") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!["website", "github_repo", "guide", "video"].includes(kind)) {
    throw new Error("Unknown resource kind");
  }
  if (!title || !url) throw new Error("Title and URL required");

  await supabase.from("resources").insert({
    kind,
    title,
    url,
    description: description || null,
  });
  revalidatePath("/admin/sources");
  revalidatePath("/internships");
}
