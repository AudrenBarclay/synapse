import type { AvailabilityStatus, Coordinates } from "@/types/core";
import type { DoctorProfile, MeetingSlot, StudentProfile, StudentYear } from "@/types";

export const STUDENT_YEAR_OPTIONS = [
  "Freshman",
  "Sophomore",
  "Junior",
  "Senior",
  "Post‑bacc"
] as const;

function parseYear(y: string | null | undefined): StudentProfile["year"] {
  const found = STUDENT_YEAR_OPTIONS.find((v) => v === y);
  return found ?? "Junior";
}

function parseAvailability(s: string | null | undefined): AvailabilityStatus {
  if (s === "available" || s === "limited" || s === "not_available") return s;
  return "limited";
}

function coords(
  lat: number | null | undefined,
  lng: number | null | undefined
): Coordinates | null {
  if (lat == null || lng == null || Number.isNaN(lat) || Number.isNaN(lng)) {
    return null;
  }
  return { lat, lng };
}

export type ProfileRow = {
  id: string;
  role: "student" | "doctor";
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  headline: string | null;
  bio: string | null;
  city: string | null;
  state: string | null;
  neighborhood: string | null;
  lat: number | null;
  lng: number | null;
  specialty: string | null;
  organization: string | null;
  open_to_shadowing: boolean | null;
  availability_status: string | null;
  areas_of_focus: string[] | null;
  doctor_interests: string[] | null;
  dress_code_preferences: string | null;
  meeting_point_preferences: string | null;
  pre_shadowing_readings: string | null;
};

export type StudentHoursRow = {
  user_id: string;
  shadowing_hours: number | null;
  clinical_hours: number | null;
  volunteer_hours: number | null;
  year: string | null;
  major: string | null;
  medical_interest: string | null;
  research_experience: string | null;
  interests: string[] | null;
  skills: string[] | null;
  saved_doctor_ids: string[] | null;
  shadowing_goals: string | null;
  previous_shadowing_experience: string | null;
};

export type MeetingSlotRow = {
  id: string;
  doctor_id: string;
  start_at: string;
  end_at: string;
  booked_by: string | null;
};

export function rowToDoctorProfile(
  row: ProfileRow,
  meetingSlots: MeetingSlot[] = []
): DoctorProfile {
  const c = coords(row.lat, row.lng);
  return {
    id: row.id,
    role: "doctor",
    name: row.full_name?.trim() ?? "",
    profilePicture: row.avatar_url,
    specialty: row.specialty?.trim() ?? "",
    organization: row.organization?.trim() || "",
    headline: row.headline?.trim() || "",
    bio: row.bio?.trim() || "",
    location: {
      city: row.city?.trim() || "",
      state: row.state?.trim() || "",
      neighborhood: row.neighborhood?.trim() || undefined,
      coordinates: c
    },
    availableForShadowing: row.open_to_shadowing ?? false,
    availabilityStatus: parseAvailability(row.availability_status),
    meetingSlots,
    interests: row.doctor_interests ?? [],
    areasOfFocus: row.areas_of_focus ?? [],
    dressCodePreferences: row.dress_code_preferences?.trim() ?? "",
    meetingPointPreferences: row.meeting_point_preferences?.trim() ?? "",
    preShadowingReadings: row.pre_shadowing_readings?.trim() ?? ""
  };
}

export function rowsToMeetingSlots(rows: MeetingSlotRow[]): MeetingSlot[] {
  return rows.map((r) => ({
    id: r.id,
    startIso: r.start_at,
    endIso: r.end_at,
    isBooked: r.booked_by != null
  }));
}

export function rowsToStudentProfile(
  profile: ProfileRow,
  hours: StudentHoursRow | null
): StudentProfile {
  const c = coords(profile.lat, profile.lng);
  return {
    id: profile.id,
    role: "student",
    name: profile.full_name?.trim() ?? "",
    profilePicture: profile.avatar_url,
    headline: profile.headline?.trim() || "",
    year: parseYear(hours?.year),
    major: hours?.major?.trim() || "",
    medicalInterest: hours?.medical_interest?.trim() || "",
    shadowingHours: hours?.shadowing_hours ?? 0,
    clinicalHours: hours?.clinical_hours ?? 0,
    volunteerHours: hours?.volunteer_hours ?? 0,
    researchExperience: hours?.research_experience?.trim() || "",
    shadowingGoals: hours?.shadowing_goals?.trim() || "",
    previousShadowingExperience: hours?.previous_shadowing_experience?.trim() || "",
    bio: profile.bio?.trim() || "",
    location: {
      city: profile.city?.trim() || "",
      state: profile.state?.trim() || "",
      neighborhood: profile.neighborhood?.trim() || undefined,
      coordinates: c
    },
    interests: hours?.interests ?? [],
    skills: hours?.skills ?? [],
    savedDoctors: hours?.saved_doctor_ids ?? []
  };
}
