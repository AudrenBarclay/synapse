import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { StudentProfileEditForm } from "@/components/profile/StudentProfileEditForm";
import { Button } from "@/components/ui/Button";
import type { ProfileRow, StudentHoursRow } from "@/lib/profileMappers";

export default async function StudentEditProfilePage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/auth");
  }
  if (profile.role === "doctor") {
    redirect("/doctor/edit");
  }
  if (profile.role !== "student") {
    redirect("/auth");
  }

  const { data: hours } = await supabase
    .from("student_hours")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Edit profile</h1>
          <p className="mt-1 text-sm text-slate-600">
            Update how you appear to doctors and in search.
          </p>
        </div>
        <Link href="/student">
          <Button variant="secondary">Back to dashboard</Button>
        </Link>
      </div>

      <StudentProfileEditForm
        initialProfile={profile as ProfileRow}
        initialHours={hours as StudentHoursRow | null}
        userId={user.id}
      />
    </main>
  );
}
