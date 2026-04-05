import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { rowsToStudentProfile, type ProfileRow, type StudentHoursRow } from "@/lib/profileMappers";
import { countWords } from "@/lib/words";
import { StudentProfileDoctorPanel } from "@/components/matching/StudentProfileDoctorPanel";

export default async function StudentProfilePage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: profileRow } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (!profileRow || profileRow.role !== "student") {
    notFound();
  }

  const { data: hoursRow } = await supabase
    .from("student_hours")
    .select("*")
    .eq("user_id", id)
    .maybeSingle();

  const student = rowsToStudentProfile(
    profileRow as ProfileRow,
    hoursRow as StudentHoursRow | null
  );
  const displayName = profileRow.full_name?.trim() ?? "";

  const {
    data: { user }
  } = await supabase.auth.getUser();
  const isOwnProfile = user?.id === id;

  const { data: viewerProfile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).single()
    : { data: null };

  const viewerIsDoctor = viewerProfile?.role === "doctor" && user && user.id !== id;

  const goalsWordCount = countWords(student.shadowingGoals);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar name={displayName} src={student.profilePicture} size="xl" />
              <div className="min-w-0">
                <div className="truncate text-lg font-semibold text-slate-900">
                  {displayName ? (
                    displayName
                  ) : (
                    <span className="text-slate-400">Name not set</span>
                  )}
                </div>
                <div className="text-sm text-slate-600">
                  {student.headline.trim() ? student.headline : ""}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {student.year ? <Badge variant="brand">{student.year}</Badge> : null}
              {student.major.trim() ? <Badge variant="slate">{student.major}</Badge> : null}
              {student.location.text.trim() ? (
                <Badge variant="slate">{student.location.text}</Badge>
              ) : null}
            </div>

            {viewerIsDoctor ? (
              <div className="border-t border-slate-100 pt-4">
                <StudentProfileDoctorPanel doctorId={user!.id} studentId={id} />
              </div>
            ) : null}

            <div className="grid gap-2">
              {isOwnProfile ? (
                <Link href="/student/edit">
                  <Button className="w-full">Edit profile</Button>
                </Link>
              ) : !viewerIsDoctor ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                  Students connect with physicians from doctor profiles. Messaging opens after a mutual
                  match.
                </div>
              ) : null}
              {isOwnProfile ? (
                <Link href="/student/requirements">
                  <Button className="w-full" variant="secondary">
                    Forms &amp; prerequisites
                  </Button>
                </Link>
              ) : null}
              <Link href={viewerIsDoctor ? "/doctor" : "/student"}>
                <Button className="w-full" variant="secondary">
                  Back to dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardContent className="space-y-3">
              <SectionHeader title="About" subtitle={student.medicalInterest} />
              <p className="text-sm leading-relaxed text-slate-700">{student.bio}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3">
              <SectionHeader
                title="Shadowing goals & objectives"
                subtitle="What this student hopes to learn (max 200 words on their editor)"
              />
              {student.shadowingGoals ? (
                <>
                  <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
                    {student.shadowingGoals}
                  </p>
                  <p className="text-xs text-slate-500">{goalsWordCount} words</p>
                </>
              ) : (
                <p className="text-sm text-slate-500">Not provided yet.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3">
              <SectionHeader
                title="Previous shadowing experience"
                subtitle="Past exposure the student notes for your review"
              />
              <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
                {student.previousShadowingExperience || "—"}
              </p>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              { label: "Shadowing hours", value: student.shadowingHours },
              { label: "Clinical hours", value: student.clinicalHours },
              { label: "Volunteer hours", value: student.volunteerHours }
            ].map((s) => (
              <Card key={s.label} className="shadow-soft">
                <CardContent className="space-y-1">
                  <div className="text-sm font-medium text-slate-600">{s.label}</div>
                  <div className="text-2xl font-semibold text-slate-900">{s.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardContent className="space-y-3">
              <SectionHeader
                title="Research experience"
                subtitle="Highlights and responsibilities"
              />
              <p className="text-sm leading-relaxed text-slate-700">
                {student.researchExperience || "—"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3">
              <SectionHeader title="Skills & interests" />
              <div className="flex flex-wrap gap-2">
                {student.skills.map((t) => (
                  <Badge key={t} variant="slate">
                    {t}
                  </Badge>
                ))}
                {student.interests.map((t) => (
                  <Badge key={t} variant="brand">
                    {t}
                  </Badge>
                ))}
                {student.skills.length === 0 && student.interests.length === 0 ? (
                  <span className="text-sm text-slate-500">Not added yet.</span>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
