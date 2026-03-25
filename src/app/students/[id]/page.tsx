import Link from "next/link";
import { notFound } from "next/navigation";
import { students } from "@/data";
import { Card, CardContent } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";

export default async function StudentProfilePage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const student = students.find((s) => s.id === id);
  if (!student) return notFound();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar name={student.name} src={student.profilePicture} size="xl" />
              <div className="min-w-0">
                <div className="truncate text-lg font-semibold text-slate-900">
                  {student.name}
                </div>
                <div className="text-sm text-slate-600">{student.headline}</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="brand">{student.year}</Badge>
              <Badge variant="slate">{student.major}</Badge>
              <Badge variant="slate">
                {student.location.neighborhood ?? student.location.city},{" "}
                {student.location.state}
              </Badge>
            </div>
            <div className="grid gap-2">
              <Link href="/messages">
                <Button className="w-full">Message</Button>
              </Link>
              <Link href="/student">
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
                {student.researchExperience}
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
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

