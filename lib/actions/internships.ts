"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getServerSupabase } from "@/lib/supabase/server";

export async function toggleSave(internshipId: string) {
  const supabase = await getServerSupabase();
  if (!supabase) return;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth?next=/internships");

  const { data: existing } = await supabase
    .from("saved_internships")
    .select("internship_id")
    .eq("user_id", user.id)
    .eq("internship_id", internshipId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("saved_internships")
      .delete()
      .eq("user_id", user.id)
      .eq("internship_id", internshipId);
  } else {
    await supabase
      .from("saved_internships")
      .insert({ user_id: user.id, internship_id: internshipId });
  }

  revalidatePath("/internships");
  revalidatePath("/account");
}
