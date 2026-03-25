import Link from "next/link";
import { notFound } from "next/navigation";
import { doctors, opportunities } from "@/data";
import { Card, CardContent } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { BookingWidget } from "@/components/booking/BookingWidget";
import { OpportunityCard } from "@/components/cards/OpportunityCard";
import { formatAvailability } from "@/utils/format";

export default async function DoctorProfilePage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const doctor = doctors.find((d) => d.id === id);
  if (!doctor) return notFound();

  const av = formatAvailability(doctor.availabilityStatus);
  const doctorOpps = opportunities.filter((o) => o.doctorId === doctor.id);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar name={doctor.name} src={doctor.profilePicture} size="xl" />
              <div className="min-w-0">
                <div className="truncate text-lg font-semibold text-slate-900">
                  {doctor.name}
                </div>
                <div className="text-sm text-slate-600">{doctor.headline}</div>
                <div className="text-sm text-slate-600">
                  {doctor.specialty} · {doctor.organization}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant={av.tone}>{av.label}</Badge>
              {doctor.availableForShadowing ? (
                <Badge variant="mint">Open to shadowing</Badge>
              ) : (
                <Badge variant="slate">Shadowing paused</Badge>
              )}
              <Badge variant="slate">
                {doctor.location.neighborhood ?? doctor.location.city},{" "}
                {doctor.location.state}
              </Badge>
            </div>
            <div className="grid gap-2">
              <Link href="/messages">
                <Button className="w-full">Message</Button>
              </Link>
              <Link href="/opportunities">
                <Button className="w-full" variant="secondary">
                  Opportunities near me
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardContent className="space-y-3">
              <SectionHeader title="About" subtitle="Professional overview" />
              <p className="text-sm leading-relaxed text-slate-700">{doctor.bio}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3">
              <SectionHeader title="Areas of interest" subtitle="Focus and mentoring topics" />
              <div className="flex flex-wrap gap-2">
                {doctor.areasOfFocus.map((t) => (
                  <Badge key={t} variant="brand">
                    {t}
                  </Badge>
                ))}
                {doctor.interests.map((t) => (
                  <Badge key={t} variant="slate">
                    {t}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <BookingWidget slots={doctor.meetingSlots} />

          <div className="space-y-3">
            <SectionHeader
              title="Shadowing opportunities"
              subtitle="Listings associated with this doctor"
              right={
                <Link href="/messages">
                  <Button variant="ghost" size="sm">
                    Ask a question
                  </Button>
                </Link>
              }
            />
            {doctorOpps.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                No listings posted yet. Message to request updated availability.
              </div>
            ) : (
              <div className="grid gap-3">
                {doctorOpps.map((o) => (
                  <OpportunityCard key={o.id} opportunity={o} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

