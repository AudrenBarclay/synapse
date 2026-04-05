import type { ProfileRow, StudentHoursRow } from "@/lib/profileMappers";
import { coerceLocationText, coerceStringArray, formatCoordForInput } from "@/lib/tags";

function str(v: unknown): string {
  if (v == null) return "";
  return typeof v === "string" ? v : String(v);
}

function strOrNull(v: unknown): string | null {
  if (v == null) return null;
  const s = typeof v === "string" ? v : String(v);
  return s;
}

function intNonNeg(v: unknown, fallback = 0): number {
  if (v == null || v === "") return fallback;
  const n = typeof v === "number" ? v : Number.parseInt(String(v), 10);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

function boolOrNull(v: unknown): boolean | null {
  if (v === true || v === false) return v;
  return null;
}

/**
 * Sanitize a raw Supabase `profiles` row before passing to client edit forms.
 */
export function normalizeProfileRowForForm(
  raw: Record<string, unknown>,
  fallbackUserId: string
): ProfileRow {
  const role = raw.role === "doctor" ? "doctor" : "student";
  return {
    id: str(raw.id) || fallbackUserId,
    role,
    email: raw.email == null ? null : strOrNull(raw.email),
    full_name: raw.full_name == null ? null : strOrNull(raw.full_name),
    avatar_url: raw.avatar_url == null ? null : strOrNull(raw.avatar_url),
    headline: raw.headline == null ? null : strOrNull(raw.headline),
    bio: raw.bio == null ? null : strOrNull(raw.bio),
    location: coerceLocationText(raw.location) || null,
    lat: (() => {
      const s = formatCoordForInput(raw.lat);
      if (s === "") return null;
      const n = Number.parseFloat(s);
      return Number.isFinite(n) ? n : null;
    })(),
    lng: (() => {
      const s = formatCoordForInput(raw.lng);
      if (s === "") return null;
      const n = Number.parseFloat(s);
      return Number.isFinite(n) ? n : null;
    })(),
    specialty: raw.specialty == null ? null : strOrNull(raw.specialty),
    organization: raw.organization == null ? null : strOrNull(raw.organization),
    open_to_shadowing: boolOrNull(raw.open_to_shadowing),
    availability_status: raw.availability_status == null ? null : strOrNull(raw.availability_status),
    areas_of_focus: coerceStringArray(raw.areas_of_focus),
    doctor_interests: coerceStringArray(raw.doctor_interests),
    dress_code_preferences:
      raw.dress_code_preferences == null ? null : strOrNull(raw.dress_code_preferences),
    meeting_point_preferences:
      raw.meeting_point_preferences == null ? null : strOrNull(raw.meeting_point_preferences),
    pre_shadowing_readings:
      raw.pre_shadowing_readings == null ? null : strOrNull(raw.pre_shadowing_readings)
  };
}

/**
 * Sanitize a raw `student_hours` row for the student edit form.
 */
export function normalizeStudentHoursRowForForm(
  raw: Record<string, unknown> | null | undefined,
  fallbackUserId: string
): StudentHoursRow | null {
  if (!raw || typeof raw !== "object") return null;
  return {
    user_id: str(raw.user_id) || fallbackUserId,
    shadowing_hours: intNonNeg(raw.shadowing_hours, 0),
    clinical_hours: intNonNeg(raw.clinical_hours, 0),
    volunteer_hours: intNonNeg(raw.volunteer_hours, 0),
    year: raw.year == null || raw.year === "" ? null : str(raw.year),
    major: raw.major == null ? null : strOrNull(raw.major),
    medical_interest: raw.medical_interest == null ? null : strOrNull(raw.medical_interest),
    research_experience:
      raw.research_experience == null ? null : strOrNull(raw.research_experience),
    interests: coerceStringArray(raw.interests),
    skills: coerceStringArray(raw.skills),
    saved_doctor_ids: coerceStringArray(raw.saved_doctor_ids),
    shadowing_goals: raw.shadowing_goals == null ? null : strOrNull(raw.shadowing_goals),
    previous_shadowing_experience:
      raw.previous_shadowing_experience == null
        ? null
        : strOrNull(raw.previous_shadowing_experience)
  };
}
