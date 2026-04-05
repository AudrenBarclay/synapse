import type { ProfileRow, StudentHoursRow } from "@/lib/profileMappers";
import {
  coerceLocationText,
  coerceStringArray,
  formatCoordForInput,
  mergeCoercedStringLists
} from "@/lib/tags";

function str(v: unknown): string {
  if (v == null) return "";
  return typeof v === "string" ? v : String(v);
}

function strOrNull(v: unknown): string | null {
  if (v == null) return null;
  const s = typeof v === "string" ? v : String(v);
  return s;
}

/** First non-empty string among several column names (legacy / alias columns). */
function firstNonEmptyStr(raw: Record<string, unknown>, ...keys: string[]): string | null {
  for (const k of keys) {
    const v = raw[k];
    if (v == null) continue;
    const s = typeof v === "string" ? v : String(v);
    const t = s.trim();
    if (t) return t;
  }
  return null;
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

function shadowingOpen(raw: Record<string, unknown>): boolean | null {
  const a = boolOrNull(raw.open_to_shadowing);
  const b = boolOrNull(raw.shadowing_available);
  if (a !== null) return a;
  if (b !== null) return b;
  return null;
}

function normalizedLocationLine(raw: Record<string, unknown>): string | null {
  const primary = coerceLocationText(raw.location).trim();
  if (primary) return primary;
  const legacy = [raw.neighborhood, raw.city, raw.state]
    .map((x) => (typeof x === "string" ? x.trim() : ""))
    .filter(Boolean)
    .join(", ");
  return legacy.trim() || null;
}

function latNum(raw: Record<string, unknown>): number | null {
  const s = formatCoordForInput(raw.lat);
  if (s === "") return null;
  const n = Number.parseFloat(s);
  return Number.isFinite(n) ? n : null;
}

function lngNum(raw: Record<string, unknown>): number | null {
  const s = formatCoordForInput(raw.lng);
  if (s === "") return null;
  const n = Number.parseFloat(s);
  return Number.isFinite(n) ? n : null;
}

/**
 * Maps a raw Supabase `profiles` row (including optional / alias columns from migration 005)
 * into the canonical `ProfileRow` shape used by forms and mappers.
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
    avatar_url: firstNonEmptyStr(raw, "avatar_url", "photo_url"),
    headline: raw.headline == null ? null : strOrNull(raw.headline),
    bio: raw.bio == null ? null : strOrNull(raw.bio),
    location: normalizedLocationLine(raw),
    lat: latNum(raw),
    lng: lngNum(raw),
    specialty: raw.specialty == null ? null : strOrNull(raw.specialty),
    organization: firstNonEmptyStr(
      raw,
      "organization",
      "hospital_name",
      "organization_name",
      "hospital"
    ),
    open_to_shadowing: shadowingOpen(raw),
    availability_status: raw.availability_status == null ? null : strOrNull(raw.availability_status),
    areas_of_focus: mergeCoercedStringLists(
      raw,
      "areas_of_focus",
      "focus_areas",
      "mentoring_topics"
    ),
    doctor_interests: mergeCoercedStringLists(
      raw,
      "doctor_interests",
      "interests",
      "tags",
      "skills"
    ),
    dress_code_preferences: firstNonEmptyStr(raw, "dress_code_preferences", "dress_preferences"),
    meeting_point_preferences: firstNonEmptyStr(
      raw,
      "meeting_point_preferences",
      "check_in_instructions",
      "check_in_details"
    ),
    pre_shadowing_readings: firstNonEmptyStr(
      raw,
      "pre_shadowing_readings",
      "pre_shadowing_readings_and_papers"
    )
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
