import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/Sidebar";
import { DoctorOpportunitiesClient } from "./DoctorOpportunitiesClient";

export default async function DoctorOpportunitiesPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth?next=/doctor/opportunities");
  }

  const { data: profileRow } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profileRow || profileRow.role !== "doctor") {
    redirect("/student");
  }

  const { data: rows, error } = await supabase
    .from("opportunities")
    .select("id, doctor_id, title, description, is_active, created_at")
    .eq("doctor_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex gap-6">
        <Sidebar
          title="Doctor"
          currentPath="/doctor/opportunities"
          items={[
            { label: "Dashboard", href: "/doctor" },
            { label: "Edit profile", href: "/doctor/edit" },
            { label: "My listings", href: "/doctor/opportunities" },
            { label: "Messages", href: "/messages" },
            { label: "My Profile", href: `/doctors/${user.id}` },
            { label: "Opportunities Near Me", href: "/opportunities" }
          ]}
        />
        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-semibold text-slate-900">Shadowing listings</h1>
              <p className="text-sm text-slate-600">
                Create listings students see on{" "}
                <Link href="/opportunities" className="font-medium text-brand-700 hover:underline">
                  Opportunities Near Me
                </Link>{" "}
                and on your public profile.
              </p>
            </div>
            <Link href="/doctor">
              <span className="text-sm font-medium text-slate-600 hover:text-slate-900">
                ← Dashboard
              </span>
            </Link>
          </div>
          <DoctorOpportunitiesClient
            doctorId={user.id}
            initialRows={rows ?? []}
            loadError={error?.message ?? null}
          />
        </div>
      </div>
    </main>
  );
}
