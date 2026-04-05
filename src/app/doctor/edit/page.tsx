import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DoctorProfileEditForm } from "@/components/profile/DoctorProfileEditForm";
import { DoctorWeekScheduleSection } from "@/components/profile/DoctorWeekScheduleSection";
import { Button } from "@/components/ui/Button";
import type { ProfileRow } from "@/lib/profileMappers";

export default async function DoctorEditProfilePage() {
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
  if (profile.role === "student") {
    redirect("/student/edit");
  }
  if (profile.role !== "doctor") {
    redirect("/auth");
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Edit profile</h1>
          <p className="mt-1 text-sm text-slate-600">
            Update your professional profile and shadowing preferences.
          </p>
        </div>
        <Link href="/doctor">
          <Button variant="secondary">Back to dashboard</Button>
        </Link>
      </div>

      <DoctorProfileEditForm initialProfile={profile as ProfileRow} userId={user.id} />

      <div className="mt-12">
        <DoctorWeekScheduleSection doctorId={user.id} />
      </div>
    </main>
  );
}
