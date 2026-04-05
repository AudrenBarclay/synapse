import Link from "next/link";
import { notFound } from "next/navigation";
import { randomUUID } from "crypto";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { BookingWidget } from "@/components/booking/BookingWidget";
import { OpportunityCard } from "@/components/cards/OpportunityCard";
import { formatAvailability } from "@/utils/format";
import {
  rowToDoctorProfile,
  rowsToMeetingSlots,
  type MeetingSlotRow
} from "@/lib/profileMappers";
import { normalizeProfileRowForForm } from "@/lib/profileFormNormalize";
import type { Opportunity } from "@/types";
import {
  mapOpportunityRows,
  OPPORTUNITY_LIST_SELECT,
  type OpportunityWithDoctorRow
} from "@/lib/opportunities";
import { DoctorProfileMatchPanel } from "@/components/matching/DoctorProfileMatchPanel";
import { DoctorWeekViewReadOnly } from "@/components/profile/DoctorWeekViewReadOnly";
import {
  normalizeWeekHalfSlots,
  normalizeWeekScheduleItems
} from "@/lib/doctorWeekSchedule";

export default async function DoctorProfilePage({
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

  if (!profileRow || profileRow.role !== "doctor") {
    notFound();
  }

  const profile = normalizeProfileRowForForm(profileRow as Record<string, unknown>, id);

  const { data: slotRows } = await supabase
    .from("meeting_slots")
    .select("*")
    .eq("doctor_id", id)
    .order("start_at", { ascending: true });

  const { data: weekSlots } = await supabase
    .from("doctor_week_half_slots")
    .select("day_of_week, half_day, is_available")
    .eq("doctor_id", id);

  const { data: weekItems } = await supabase
    .from("doctor_schedule_items")
    .select("id, day_of_week, half_day, title, details")
    .eq("doctor_id", id)
    .order("sort_order", { ascending: true });

  const meetingSlots = rowsToMeetingSlots(
    Array.isArray(slotRows) ? (slotRows as MeetingSlotRow[]) : []
  );
  const doctor = rowToDoctorProfile(profile, meetingSlots);
  const weekSlotsNormalized = normalizeWeekHalfSlots(weekSlots ?? null);
  const weekItemsNormalized = normalizeWeekScheduleItems(weekItems ?? null, () => randomUUID());
  const av = formatAvailability(doctor.availabilityStatus);
  const doctorDisplayName = profile.full_name?.trim() ?? "";

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const isOwnProfile = user?.id === id;

  const { data: viewerProfile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).single()
    : { data: null };

  const { data: listingRows } = await supabase
    .from("opportunities")
    .select(OPPORTUNITY_LIST_SELECT)
    .eq("doctor_id", id)
    .order("created_at", { ascending: false });

  const doctorOpps: Opportunity[] = mapOpportunityRows(
    (listingRows as OpportunityWithDoctorRow[] | null) ?? null,
    null,
    null
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar name={doctorDisplayName} src={doctor.profilePicture} size="xl" />
              <div className="min-w-0">
                <div className="truncate text-lg font-semibold text-slate-900">
                  {doctorDisplayName ? (
                    doctorDisplayName
                  ) : (
                    <span className="text-slate-400">Name not set</span>
                  )}
                </div>
                <div className="text-sm text-slate-600">
                  {doctor.headline.trim() ? doctor.headline : ""}
                </div>
                <div className="text-sm text-slate-600">
                  {[doctor.specialty, doctor.organization].filter(Boolean).join(" · ") || (
                    <span className="text-slate-400">Add specialty &amp; organization</span>
                  )}
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
              {doctor.location.text.trim() ? (
                <Badge variant="slate">{doctor.location.text}</Badge>
              ) : (
                <Badge variant="slate">Location not set</Badge>
              )}
            </div>

            {!isOwnProfile ? (
              <div className="border-t border-slate-100 pt-4">
                <DoctorProfileMatchPanel
                  doctorId={id}
                  viewerUserId={user?.id ?? null}
                  viewerRole={(viewerProfile?.role as "student" | "doctor") ?? null}
                />
              </div>
            ) : (
              <div className="grid gap-2 border-t border-slate-100 pt-4">
                <Link href="/doctor/edit">
                  <Button className="w-full">Edit profile</Button>
                </Link>
              </div>
            )}

            <div className="grid gap-2">
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

          {(doctor.dressCodePreferences ||
            doctor.meetingPointPreferences ||
            doctor.preShadowingReadings) ? (
            <Card>
              <CardContent className="space-y-4">
                <SectionHeader
                  title="Shadowing logistics & preparation"
                  subtitle="Dress code, where to meet, and readings before you arrive"
                />
                {doctor.dressCodePreferences ? (
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Dress / attire
                    </div>
                    <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">
                      {doctor.dressCodePreferences}
                    </p>
                  </div>
                ) : null}
                {doctor.meetingPointPreferences ? (
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Meeting point
                    </div>
                    <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">
                      {doctor.meetingPointPreferences}
                    </p>
                  </div>
                ) : null}
                {doctor.preShadowingReadings ? (
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Pre-shadowing readings & papers
                    </div>
                    <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">
                      {doctor.preShadowingReadings}
                    </p>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ) : null}

          <DoctorWeekViewReadOnly slots={weekSlotsNormalized} items={weekItemsNormalized} />

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
                {doctor.areasOfFocus.length === 0 && doctor.interests.length === 0 ? (
                  <span className="text-sm text-slate-500">Not added yet.</span>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <BookingWidget slots={doctor.meetingSlots} />

          <div className="space-y-3">
            <SectionHeader
              title="Shadowing opportunities"
              subtitle="Active listings posted by this physician"
            />
            {doctorOpps.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                No active listings yet. Check back later or message the physician from their profile.
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
