"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { uploadProfileAvatar } from "@/lib/uploadAvatar";
import { joinTagList, parseTagList } from "@/lib/tags";
import type { ProfileRow, StudentHoursRow } from "@/lib/profileMappers";
import { STUDENT_YEAR_OPTIONS } from "@/lib/profileMappers";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ProfilePictureUpload } from "@/components/profile/ProfilePictureUpload";
import { countWords, MAX_SHADOWING_GOALS_WORDS, truncateToWordLimit } from "@/lib/words";

function numOrZero(v: string): number {
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function parseCoord(v: string): number | null {
  const t = v.trim();
  if (!t) return null;
  const n = Number.parseFloat(t);
  return Number.isFinite(n) ? n : null;
}

export function StudentProfileEditForm({
  initialProfile,
  initialHours,
  userId
}: {
  initialProfile: ProfileRow;
  initialHours: StudentHoursRow | null;
  userId: string;
}) {
  const router = useRouter();
  const [fullName, setFullName] = React.useState(initialProfile.full_name ?? "");
  const [headline, setHeadline] = React.useState(initialProfile.headline ?? "");
  const [bio, setBio] = React.useState(initialProfile.bio ?? "");
  const [city, setCity] = React.useState(initialProfile.city ?? "");
  const [stateUS, setStateUS] = React.useState(initialProfile.state ?? "");
  const [neighborhood, setNeighborhood] = React.useState(
    initialProfile.neighborhood ?? ""
  );
  const [latStr, setLatStr] = React.useState(
    initialProfile.lat != null ? String(initialProfile.lat) : ""
  );
  const [lngStr, setLngStr] = React.useState(
    initialProfile.lng != null ? String(initialProfile.lng) : ""
  );

  const [shadowingHours, setShadowingHours] = React.useState(
    String(initialHours?.shadowing_hours ?? 0)
  );
  const [clinicalHours, setClinicalHours] = React.useState(
    String(initialHours?.clinical_hours ?? 0)
  );
  const [volunteerHours, setVolunteerHours] = React.useState(
    String(initialHours?.volunteer_hours ?? 0)
  );
  const [year, setYear] = React.useState(() => {
    const y = initialHours?.year ?? "";
    return (STUDENT_YEAR_OPTIONS as readonly string[]).includes(y) ? y : "";
  });
  const [major, setMajor] = React.useState(initialHours?.major ?? "");
  const [medicalInterest, setMedicalInterest] = React.useState(
    initialHours?.medical_interest ?? ""
  );
  const [researchExperience, setResearchExperience] = React.useState(
    initialHours?.research_experience ?? ""
  );
  const [interestsStr, setInterestsStr] = React.useState(
    joinTagList(initialHours?.interests ?? [])
  );
  const [skillsStr, setSkillsStr] = React.useState(joinTagList(initialHours?.skills ?? []));
  const [shadowingGoals, setShadowingGoals] = React.useState(
    initialHours?.shadowing_goals ?? ""
  );
  const [previousShadowing, setPreviousShadowing] = React.useState(
    initialHours?.previous_shadowing_experience ?? ""
  );

  const goalsWordCount = countWords(shadowingGoals);

  const [photoPreview, setPhotoPreview] = React.useState<string | null>(
    initialProfile.avatar_url
  );
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
  const [clearAvatar, setClearAvatar] = React.useState(false);

  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [geoHint, setGeoHint] = React.useState<string | null>(null);

  const displayName = fullName.trim();

  const useDeviceLocation = () => {
    if (!navigator.geolocation) {
      setGeoHint("Geolocation is not available in this browser.");
      return;
    }
    setGeoHint("Getting location…");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatStr(String(pos.coords.latitude));
        setLngStr(String(pos.coords.longitude));
        setGeoHint("Coordinates filled from your device.");
      },
      () => setGeoHint("Could not read location. Allow access or enter coordinates manually."),
      { enableHighAccuracy: true, timeout: 12_000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (goalsWordCount > MAX_SHADOWING_GOALS_WORDS) {
      setError(
        `Shadowing goals must be at most ${MAX_SHADOWING_GOALS_WORDS} words (currently ${goalsWordCount}).`
      );
      return;
    }
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

      const lat = parseCoord(latStr);
      const lng = parseCoord(lngStr);

      const profilePayload: Record<string, unknown> = {
        full_name: fullName.trim(),
        headline: headline.trim(),
        bio: bio.trim(),
        city: city.trim(),
        state: stateUS.trim(),
        neighborhood: neighborhood.trim() || null,
        lat,
        lng,
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

      const hoursPayload = {
        user_id: userId,
        shadowing_hours: numOrZero(shadowingHours),
        clinical_hours: numOrZero(clinicalHours),
        volunteer_hours: numOrZero(volunteerHours),
        year: year.trim() || null,
        major: major.trim(),
        medical_interest: medicalInterest.trim(),
        research_experience: researchExperience.trim(),
        interests: parseTagList(interestsStr),
        skills: parseTagList(skillsStr),
        shadowing_goals: shadowingGoals.trim(),
        previous_shadowing_experience: previousShadowing.trim(),
        saved_doctor_ids: initialHours?.saved_doctor_ids ?? [],
        updated_at: new Date().toISOString()
      };

      const { error: hErr } = await supabase
        .from("student_hours")
        .upsert(hoursPayload, { onConflict: "user_id" });

      if (hErr) {
        setError(hErr.message);
        return;
      }

      router.push("/student");
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
          <SectionHeader title="Basics" subtitle="Name and how you appear to mentors" />
          <Input label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <Input
            label="Headline"
            placeholder="e.g. Pre‑med · Biology @ State University"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
          />
          <Textarea label="About you" value={bio} onChange={(e) => setBio(e.target.value)} />
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardContent className="space-y-4 pt-6">
          <SectionHeader
            title="Location"
            subtitle="Used for “opportunities near me” and distance on the map"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} />
            <Input label="State" value={stateUS} onChange={(e) => setStateUS(e.target.value)} />
          </div>
          <Input
            label="Neighborhood (optional)"
            value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Latitude"
              hint="Decimal degrees, e.g. 33.749"
              value={latStr}
              onChange={(e) => setLatStr(e.target.value)}
            />
            <Input
              label="Longitude"
              hint="Decimal degrees, e.g. -84.388"
              value={lngStr}
              onChange={(e) => setLngStr(e.target.value)}
            />
          </div>
          <Button type="button" variant="secondary" size="sm" onClick={useDeviceLocation}>
            Fill lat/lng from device location
          </Button>
          {geoHint ? <p className="text-sm text-slate-600">{geoHint}</p> : null}
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardContent className="space-y-4 pt-6">
          <SectionHeader
            title="Shadowing goals & objectives"
            subtitle="What you want from shadowing — visible to doctors (max 200 words)"
          />
          <Textarea
            label="Goals"
            value={shadowingGoals}
            onChange={(e) => setShadowingGoals(e.target.value)}
            hint={
              goalsWordCount > MAX_SHADOWING_GOALS_WORDS
                ? `Over limit by ${goalsWordCount - MAX_SHADOWING_GOALS_WORDS} words. Trim to save.`
                : `${goalsWordCount} / ${MAX_SHADOWING_GOALS_WORDS} words`
            }
          />
          {goalsWordCount > MAX_SHADOWING_GOALS_WORDS ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() =>
                setShadowingGoals(truncateToWordLimit(shadowingGoals, MAX_SHADOWING_GOALS_WORDS))
              }
            >
              Trim to {MAX_SHADOWING_GOALS_WORDS} words
            </Button>
          ) : null}
          <Textarea
            label="Previous shadowing experience"
            hint="Summarize past shadowing or clinical observation."
            value={previousShadowing}
            onChange={(e) => setPreviousShadowing(e.target.value)}
            rows={5}
          />
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardContent className="space-y-4 pt-6">
          <SectionHeader title="Academic & hours" subtitle="Track shadowing and clinical exposure" />
          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              label="Shadowing hours"
              type="number"
              min={0}
              value={shadowingHours}
              onChange={(e) => setShadowingHours(e.target.value)}
            />
            <Input
              label="Clinical hours"
              type="number"
              min={0}
              value={clinicalHours}
              onChange={(e) => setClinicalHours(e.target.value)}
            />
            <Input
              label="Volunteer hours"
              type="number"
              min={0}
              value={volunteerHours}
              onChange={(e) => setVolunteerHours(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-800">Year</label>
            <select
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-600/30 focus:border-brand-600"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            >
              <option value="">Select year</option>
              {STUDENT_YEAR_OPTIONS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <Input label="Major" value={major} onChange={(e) => setMajor(e.target.value)} />
          <Input
            label="Specific interest in medicine"
            value={medicalInterest}
            onChange={(e) => setMedicalInterest(e.target.value)}
          />
          <Textarea
            label="Research experience"
            value={researchExperience}
            onChange={(e) => setResearchExperience(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardContent className="space-y-4 pt-6">
          <SectionHeader
            title="Tags"
            subtitle="Comma-separated — e.g. cardiology, health equity"
          />
          <Textarea
            label="Interests"
            value={interestsStr}
            onChange={(e) => setInterestsStr(e.target.value)}
          />
          <Textarea
            label="Skills"
            value={skillsStr}
            onChange={(e) => setSkillsStr(e.target.value)}
          />
        </CardContent>
      </Card>

      {error ? (
        <p className="text-sm text-rose-600" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" isLoading={saving} disabled={saving}>
          Save profile
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.push("/student")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
