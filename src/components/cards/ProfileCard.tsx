import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import type { DoctorProfile, StudentProfile } from "@/types";
import { formatAvailability } from "@/utils/format";

export function DoctorProfileCard({ doctor }: { doctor: DoctorProfile }) {
  const av = formatAvailability(doctor.availabilityStatus);
  return (
    <Card className="transition hover:shadow-card">
      <CardContent className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Avatar name={doctor.name} src={doctor.profilePicture} />
          <div className="space-y-1">
            <div className="text-sm font-semibold text-slate-900">{doctor.name}</div>
            <div className="text-sm text-slate-600">
              {doctor.specialty} · {doctor.organization}
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <Badge variant={av.tone}>{av.label}</Badge>
              {doctor.availableForShadowing ? (
                <Badge variant="mint">Open to shadowing</Badge>
              ) : (
                <Badge variant="slate">Shadowing paused</Badge>
              )}
            </div>
          </div>
        </div>
        <Link href={`/doctors/${doctor.id}`}>
          <Button size="sm" variant="secondary">
            View
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export function StudentProfileCard({ student }: { student: StudentProfile }) {
  return (
    <Card className="transition hover:shadow-card">
      <CardContent className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Avatar name={student.name} src={student.profilePicture} />
          <div className="space-y-1">
            <div className="text-sm font-semibold text-slate-900">
              {student.name}
            </div>
            <div className="text-sm text-slate-600">{student.headline}</div>
            <div className="flex flex-wrap gap-2 pt-1">
              <Badge variant="brand">{student.year}</Badge>
              <Badge variant="slate">{student.major}</Badge>
            </div>
          </div>
        </div>
        <Link href={`/students/${student.id}`}>
          <Button size="sm" variant="secondary">
            View
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

