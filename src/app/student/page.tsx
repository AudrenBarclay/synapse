import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/Sidebar";
import { StatCard } from "@/components/ui/StatCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { DoctorProfileCard } from "@/components/cards/ProfileCard";
import { OpportunityCard } from "@/components/cards/OpportunityCard";
import { Button } from "@/components/ui/Button";
import {
  rowToDoctorProfile,
  rowsToStudentProfile,
  type StudentHoursRow
} from "@/lib/profileMappers";
import { normalizeProfileRowForForm } from "@/lib/profileFormNormalize";
import {
  mapOpportunityRows,
  OPPORTUNITY_LIST_SELECT,
  type OpportunityWithDoctorRow
} from "@/lib/opportunities";
import { REQUIRED_DOCUMENT_KEYS } from "@/lib/constants/requirements";

export default async function StudentDashboardPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth?next=/student");
  }

  const { data: profileRow } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profileRow) {
    redirect("/auth?next=/student");
  }
  if (profileRow.role === "doctor") {
    redirect("/doctor");
  }
  if (profileRow.role !== "student") {
    redirect("/auth");
  }

  const { data: hoursRow } = await supabase
    .from("student_hours")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const myProfile = normalizeProfileRowForForm(profileRow as Record<string, unknown>, user.id);
  const me = rowsToStudentProfile(myProfile, hoursRow as StudentHoursRow | null);
  const displayName = myProfile.full_name?.trim() ?? "";

  const { data: doctorRows } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "doctor")
    .limit(12);

  const suggestedDoctors = doctorRows
    ?.slice(0, 6)
    .map((r) =>
      rowToDoctorProfile(
        normalizeProfileRowForForm(r as Record<string, unknown>, String(r.id)),
        []
      )
    )
    .slice(0, 3);

  const { data: oppRows } = await supabase
    .from("opportunities")
    .select(OPPORTUNITY_LIST_SELECT)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(40);

  const allOpportunities = mapOpportunityRows(
    (oppRows as OpportunityWithDoctorRow[] | null) ?? null,
    null,
    null
  );
  const opportunitiesNear = allOpportunities
    .slice()
    .sort((a, b) => {
      const da = a.distanceMiles ?? Infinity;
      const db = b.distanceMiles ?? Infinity;
      return da - db;
    })
    .slice(0, 3);

  const { data: docRows } = await supabase
    .from("student_documents")
    .select("requirement_key")
    .eq("student_id", user.id);
  const uploadedKeys = new Set(docRows?.map((d) => d.requirement_key) ?? []);
  const prerequisitesComplete = REQUIRED_DOCUMENT_KEYS.every((k) => uploadedKeys.has(k));

  const noOpportunitiesOnNetwork = allOpportunities.length === 0;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex gap-6">
        <Sidebar
          title="Student"
          currentPath="/student"
          items={[
            { label: "Dashboard", href: "/student" },
            { label: "Edit profile", href: "/student/edit" },
            { label: "Forms & prerequisites", href: "/student/requirements" },
            { label: "Opportunities Near Me", href: "/opportunities" },
            { label: "Messages", href: "/messages" },
            { label: "My Profile", href: `/students/${me.id}` }
          ]}
        />

        <div className="min-w-0 flex-1 space-y-6">
          {!prerequisitesComplete ? (
            <div className="rounded-3xl border border-amber-200 bg-amber-50/90 p-5 shadow-soft">
              <div className="text-sm font-semibold text-amber-950">Finish your prerequisite uploads</div>
              <p className="mt-1 text-sm text-amber-900/90">
                Upload all required forms before you can request a connection with a physician.
              </p>
              <Link href="/student/requirements" className="mt-3 inline-block">
                <Button size="sm">Go to forms &amp; uploads</Button>
              </Link>
            </div>
          ) : null}

          <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-card">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div className="space-y-1">
                {!displayName ? (
                  <>
                    <div className="text-sm font-semibold text-slate-900">Complete your profile</div>
                    <p className="text-sm text-slate-600">
                      Add your name and headline under Edit profile. Nothing here is filled in until you
                      save it.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-sm font-semibold text-slate-900">
                      Welcome back, {displayName}
                    </div>
                    <div className="text-sm text-slate-600">
                      {me.headline.trim()
                        ? me.headline
                        : "Add a headline in Edit profile."}
                    </div>
                  </>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href="/student/edit">
                  <Button>Edit profile</Button>
                </Link>
                <Link href="/messages">
                  <Button variant="secondary">Open messages</Button>
                </Link>
                <Link href="/opportunities">
                  <Button variant="secondary">Find opportunities</Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <StatCard label="Shadowing hours" value={`${me.shadowingHours}`} tone="brand" />
            <StatCard label="Clinical hours" value={`${me.clinicalHours}`} tone="mint" />
            <StatCard
              label="Saved doctors"
              value={`${me.savedDoctors.length}`}
              tone="slate"
            />
            <StatCard label="Active listings (network)" value={`${allOpportunities.length}`} />
          </div>
          <p className="text-xs text-slate-500">
            Hour and saved-doctor counts are read from your Supabase profile. The listing count is how
            many active opportunities exist on the whole network (may be zero).
          </p>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-3">
              <SectionHeader
                title="Doctors on the network"
                subtitle="Profiles loaded from Supabase — empty until physicians sign up"
                right={
                  <Link href="/opportunities">
                    <Button variant="ghost" size="sm">
                      Explore
                    </Button>
                  </Link>
                }
              />
              <div className="grid gap-3">
                {suggestedDoctors?.length ? (
                  suggestedDoctors.map((d) => <DoctorProfileCard key={d.id} doctor={d} />)
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    No doctor profiles yet.
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <SectionHeader title="Opportunities" subtitle="Active listings on the network" />
              <div className="grid gap-3">
                {noOpportunitiesOnNetwork ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    No opportunities yet.
                  </div>
                ) : (
                  opportunitiesNear.map((o) => <OpportunityCard key={o.id} opportunity={o} />)
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
