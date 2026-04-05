import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/Sidebar";
import { StatCard } from "@/components/ui/StatCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StudentProfileCard } from "@/components/cards/ProfileCard";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  rowToDoctorProfile,
  rowsToStudentProfile,
  type ProfileRow,
  type StudentHoursRow
} from "@/lib/profileMappers";
import type { StudentProfile } from "@/types";
import { formatAvailability } from "@/utils/format";
import { PendingMatchesSection } from "@/components/matching/PendingMatchesSection";

export default async function DoctorDashboardPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const { data: profileRow } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profileRow) {
    redirect("/auth");
  }
  if (profileRow.role === "student") {
    redirect("/student");
  }
  if (profileRow.role !== "doctor") {
    redirect("/auth");
  }

  const { count: slotCount } = await supabase
    .from("meeting_slots")
    .select("*", { count: "exact", head: true })
    .eq("doctor_id", user.id);

  const { count: studentCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "student");

  const { count: myListingCount } = await supabase
    .from("opportunities")
    .select("*", { count: "exact", head: true })
    .eq("doctor_id", user.id)
    .eq("is_active", true);

  const me = rowToDoctorProfile(profileRow as ProfileRow, []);
  const av = formatAvailability(me.availabilityStatus);
  const doctorDisplayName = profileRow.full_name?.trim() ?? "";

  const { data: studentRows } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "student")
    .order("created_at", { ascending: false })
    .limit(6);

  const studentsResolved: StudentProfile[] = [];
  for (const row of studentRows ?? []) {
    const { data: h } = await supabase
      .from("student_hours")
      .select("*")
      .eq("user_id", row.id)
      .maybeSingle();
    studentsResolved.push(
      rowsToStudentProfile(row as ProfileRow, h as StudentHoursRow | null)
    );
  }

  const preview = studentsResolved.slice(0, 2);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex gap-6">
        <Sidebar
          title="Doctor"
          currentPath="/doctor"
          items={[
            { label: "Dashboard", href: "/doctor" },
            { label: "Edit profile", href: "/doctor/edit" },
            { label: "My listings", href: "/doctor/opportunities" },
            { label: "Messages", href: "/messages" },
            { label: "My Profile", href: `/doctors/${me.id}` },
            { label: "Opportunities Near Me", href: "/opportunities" }
          ]}
        />

        <div className="min-w-0 flex-1 space-y-6">
          <PendingMatchesSection doctorId={user.id} />

          <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-card">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div className="space-y-1">
                {!doctorDisplayName ? (
                  <>
                    <div className="text-sm font-semibold text-slate-900">Complete your profile</div>
                    <p className="text-sm text-slate-600">
                      Add your name under Edit profile. Specialty and organization also come from your
                      saved profile.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-sm font-semibold text-slate-900">
                      Welcome, {doctorDisplayName}
                    </div>
                    <div className="text-sm text-slate-600">
                      {[me.specialty, me.organization].filter(Boolean).join(" · ") ||
                        "Add specialty and organization in Edit profile."}
                    </div>
                  </>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={av.tone}>{av.label}</Badge>
                {me.availableForShadowing ? (
                  <Badge variant="mint">Open to students</Badge>
                ) : (
                  <Badge variant="slate">Shadowing paused</Badge>
                )}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
              <Link href="/doctor/edit">
                <Button>Edit profile</Button>
              </Link>
              <Link href="/doctor/opportunities">
                <Button variant="secondary">Manage listings</Button>
              </Link>
              <Link href="/messages">
                <Button variant="secondary">Open messages</Button>
              </Link>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Students on the network" value={`${studentCount ?? 0}`} />
            <StatCard label="Active listings" value={`${myListingCount ?? 0}`} tone="brand" />
            <StatCard label="Meeting slots" value={`${slotCount ?? 0}`} tone="mint" />
            <StatCard label="Availability" value={av.label} tone={av.tone} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-3">
              <SectionHeader
                title="Student profiles"
                subtitle="Recently joined students on the network"
                right={
                  <Link href="/messages">
                    <Button variant="ghost" size="sm">
                      View inbox
                    </Button>
                  </Link>
                }
              />
              <div className="grid gap-3">
                {preview.length ? (
                  preview.map((s) => <StudentProfileCard key={s.id} student={s} />)
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    No student profiles yet.
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <SectionHeader
                title="Messages"
                subtitle="Open your inbox to reply to students"
              />
              <Card className="transition hover:shadow-card">
                <CardContent className="space-y-2">
                  <div className="text-sm text-slate-600">
                    Open your inbox to see conversations with students you have matched with.
                  </div>
                  <div className="flex justify-end">
                    <Link href="/messages">
                      <Button size="sm" variant="secondary">
                        Open messages
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-soft">
            <SectionHeader
              title="Manage shadowing availability"
              subtitle="Update your doctor profile to reflect openness and scheduling."
              right={<Badge variant="brand">Profile</Badge>}
            />
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-slate-600">
                Edit availability and shadowing preferences on your public profile page.
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href="/doctor/edit">
                  <Button variant="secondary">Open full editor</Button>
                </Link>
                <Link href={`/doctors/${me.id}`}>
                  <Button variant="ghost">View public profile</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
