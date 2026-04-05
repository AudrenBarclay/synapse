"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { uploadProfileAvatar } from "@/lib/uploadAvatar";
import { joinTagListFromUnknown, parseTagList } from "@/lib/tags";
import type { ProfileRow } from "@/lib/profileMappers";
import type { AvailabilityStatus } from "@/types/core";
import {
  serializeAvailabilitySchedule,
  type WeekHalfSlotDraft,
  type WeekScheduleItemDraft
} from "@/lib/doctorWeekSchedule";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ProfilePictureUpload } from "@/components/profile/ProfilePictureUpload";
import { DoctorWeekScheduleSection } from "@/components/profile/DoctorWeekScheduleSection";

const AV_OPTIONS: { value: AvailabilityStatus; label: string }[] = [
  { value: "available", label: "Available" },
  { value: "limited", label: "Limited" },
  { value: "not_available", label: "Not available" }
];

export function DoctorProfileEditForm({
  initialProfile,
  userId,
  initialWeekSlots,
  initialWeekItems
}: {
  initialProfile: ProfileRow;
  userId: string;
  initialWeekSlots: WeekHalfSlotDraft[];
  initialWeekItems: WeekScheduleItemDraft[];
}) {
  const router = useRouter();
  const [fullName, setFullName] = React.useState(String(initialProfile.full_name ?? ""));
  const [headline, setHeadline] = React.useState(String(initialProfile.headline ?? ""));
  const [bio, setBio] = React.useState(String(initialProfile.bio ?? ""));
  const [locationText, setLocationText] = React.useState(String(initialProfile.location ?? ""));

  const [specialty, setSpecialty] = React.useState(String(initialProfile.specialty ?? ""));
  const [organization, setOrganization] = React.useState(
    String(initialProfile.organization ?? "")
  );
  const [openToShadowing, setOpenToShadowing] = React.useState(
    initialProfile.open_to_shadowing ?? false
  );
  const [availabilityStatus, setAvailabilityStatus] = React.useState<AvailabilityStatus>(
    initialProfile.availability_status === "available" ||
      initialProfile.availability_status === "limited" ||
      initialProfile.availability_status === "not_available"
      ? initialProfile.availability_status
      : "limited"
  );
  const [areasStr, setAreasStr] = React.useState(
    joinTagListFromUnknown(initialProfile.areas_of_focus)
  );
  const [interestsStr, setInterestsStr] = React.useState(
    joinTagListFromUnknown(initialProfile.doctor_interests)
  );
  const [dressCode, setDressCode] = React.useState(
    String(initialProfile.dress_code_preferences ?? "")
  );
  const [meetingPoint, setMeetingPoint] = React.useState(
    String(initialProfile.meeting_point_preferences ?? "")
  );
  const [preReadings, setPreReadings] = React.useState(
    String(initialProfile.pre_shadowing_readings ?? "")
  );

  const [photoPreview, setPhotoPreview] = React.useState<string | null>(
    initialProfile.avatar_url
  );
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
  const [clearAvatar, setClearAvatar] = React.useState(false);

  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [weekSlots, setWeekSlots] = React.useState<WeekHalfSlotDraft[]>(initialWeekSlots);
  const [weekItems, setWeekItems] = React.useState<WeekScheduleItemDraft[]>(initialWeekItems);

  const displayName = fullName.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      let avatarUrl: string | null | undefined = clearAvatar && !avatarFile ? null : undefined;
      if (avatarFile) {
        const up = await uploadProfileAvatar(supabase, userId, avatarFile);
        if ("error" in up) {
          setError(up.error);
          return;
        }
        avatarUrl = up.publicUrl;
      } else if (clearAvatar) {
        avatarUrl = null;
      }

      const profilePayload: Record<string, unknown> = {
        full_name: fullName.trim(),
        headline: headline.trim(),
        bio: bio.trim(),
        location: locationText.trim(),
        specialty: specialty.trim() || null,
        organization: organization.trim() || null,
        open_to_shadowing: openToShadowing,
        availability_status: availabilityStatus,
        areas_of_focus: parseTagList(areasStr),
        doctor_interests: parseTagList(interestsStr),
        dress_code_preferences: dressCode.trim(),
        meeting_point_preferences: meetingPoint.trim(),
        pre_shadowing_readings: preReadings.trim(),
        availability_schedule: serializeAvailabilitySchedule(weekSlots, weekItems),
        updated_at: new Date().toISOString()
      };
      if (avatarUrl !== undefined) {
        profilePayload.avatar_url = avatarUrl;
      }

      const { error: pErr } = await supabase
        .from("profiles")
        .update(profilePayload)
        .eq("id", userId);

      if (pErr) {
        setError(pErr.message);
        return;
      }

      router.push("/doctor");
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card className="shadow-card">
        <CardContent className="space-y-4 pt-6">
          <SectionHeader title="Photo" subtitle="Shown on your public profile" />
          <ProfilePictureUpload
            name={displayName}
            value={clearAvatar ? null : photoPreview}
            onChange={(url) => {
              setPhotoPreview(url);
              if (!url) {
                setClearAvatar(true);
                setAvatarFile(null);
              }
            }}
            onFileSelect={(f) => {
              setAvatarFile(f);
              if (f) setClearAvatar(false);
            }}
          />
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardContent className="space-y-4 pt-6">
          <SectionHeader title="Professional" subtitle="How students find and understand you" />
          <Input label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <Input label="Specialty" value={specialty} onChange={(e) => setSpecialty(e.target.value)} />
          <Input
            label="Organization / hospital"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
          />
          <Input
            label="Headline"
            placeholder="e.g. Cardiologist · teaching & preventive care"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
          />
          <Textarea label="Bio" value={bio} onChange={(e) => setBio(e.target.value)} />
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardContent className="space-y-4 pt-6">
          <SectionHeader
            title="Shadowing & availability"
            subtitle="Control whether pre‑med students can reach out for shadowing"
          />
          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-600"
              checked={openToShadowing}
              onChange={(e) => setOpenToShadowing(e.target.checked)}
            />
            <span>
              <span className="text-sm font-medium text-slate-900">Open to student shadowing</span>
              <span className="mt-0.5 block text-sm text-slate-600">
                Students still connect via a mutual match before messaging; this signals you welcome shadowing.
              </span>
            </span>
          </label>
          <div>
            <label className="text-sm font-medium text-slate-800">Availability status</label>
            <select
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-600/30 focus:border-brand-600"
              value={availabilityStatus}
              onChange={(e) => setAvailabilityStatus(e.target.value as AvailabilityStatus)}
            >
              {AV_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardContent className="space-y-4 pt-6">
          <SectionHeader title="Location" subtitle="Where you practice — shown on your profile" />
          <Textarea
            label="Location"
            hint="e.g. Atlanta, GA · Midtown or campus / hospital name"
            rows={2}
            value={locationText}
            onChange={(e) => setLocationText(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardContent className="space-y-4 pt-6">
          <SectionHeader
            title="Student logistics & preparation"
            subtitle="Shown on your public profile so students know how to prepare"
          />
          <Textarea
            label="Dress / attire preferences"
            hint="e.g. business casual, closed-toe shoes, white coat provided"
            value={dressCode}
            onChange={(e) => setDressCode(e.target.value)}
            rows={3}
          />
          <Textarea
            label="Meeting point preferences"
            hint="Where students should check in — lobby, clinic suite, etc."
            value={meetingPoint}
            onChange={(e) => setMeetingPoint(e.target.value)}
            rows={3}
          />
          <Textarea
            label="Pre-shadowing readings & papers"
            hint="Articles, policies, or links you want students to review beforehand"
            value={preReadings}
            onChange={(e) => setPreReadings(e.target.value)}
            rows={5}
          />
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardContent className="space-y-4 pt-6">
          <SectionHeader title="Focus areas" subtitle="Comma-separated tags" />
          <Textarea
            label="Areas of focus"
            value={areasStr}
            onChange={(e) => setAreasStr(e.target.value)}
          />
          <Textarea
            label="Interests & mentoring topics"
            value={interestsStr}
            onChange={(e) => setInterestsStr(e.target.value)}
          />
        </CardContent>
      </Card>

      <DoctorWeekScheduleSection
        slots={weekSlots}
        items={weekItems}
        onSlotsChange={setWeekSlots}
        onItemsChange={setWeekItems}
      />

      {error ? (
        <p className="text-sm text-rose-600" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" isLoading={saving} disabled={saving}>
          Save profile
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.push("/doctor")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
