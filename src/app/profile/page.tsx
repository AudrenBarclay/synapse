import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function ProfileRedirectPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth");
  }
  const { data: p } = await supabase
    .from("profiles")
    .select("role, id")
    .eq("id", user.id)
    .single();
  if (!p) {
    redirect("/auth");
  }
  redirect(p.role === "doctor" ? `/doctors/${p.id}` : `/students/${p.id}`);
}
