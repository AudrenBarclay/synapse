import type { SupabaseClient } from "@supabase/supabase-js";

export type WeekHalfSlotDraft = {
  day_of_week: number;
  half_day: "am" | "pm";
  is_available: boolean;
};

export type WeekScheduleItemDraft = {
  id: string;
  day_of_week: number;
  half_day: "am" | "pm";
  title: string;
  details: string;
};

function isAmPm(v: unknown): v is "am" | "pm" {
  return v === "am" || v === "pm";
}

/** Safe parse of week half-slot rows (null / non-array / bad rows ignored). */
export function normalizeWeekHalfSlots(raw: unknown): WeekHalfSlotDraft[] {
  if (!Array.isArray(raw)) return [];
  const out: WeekHalfSlotDraft[] = [];
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const d = Number(r.day_of_week);
    if (!Number.isInteger(d) || d < 0 || d > 6) continue;
    if (!isAmPm(r.half_day)) continue;
    out.push({
      day_of_week: d,
      half_day: r.half_day,
      is_available: Boolean(r.is_available)
    });
  }
  return out;
}

/**
 * Safe parse of schedule item rows. Rows without a usable id get `generateId()`
 * so the client can key them until the next full save reloads server ids.
 */
export function normalizeWeekScheduleItems(
  raw: unknown,
  generateId: () => string
): WeekScheduleItemDraft[] {
  if (!Array.isArray(raw)) return [];
  const out: WeekScheduleItemDraft[] = [];
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const d = Number(r.day_of_week);
    if (!Number.isInteger(d) || d < 0 || d > 6) continue;
    if (!isAmPm(r.half_day)) continue;
    const id = typeof r.id === "string" && r.id.length > 0 ? r.id : generateId();
    const title = typeof r.title === "string" ? r.title : "";
    const details = typeof r.details === "string" ? r.details : "";
    out.push({
      id,
      day_of_week: d,
      half_day: r.half_day,
      title,
      details
    });
  }
  return out;
}

/** Build 14 upsert rows (every day × am/pm) for Supabase. */
export function buildWeekSlotUpsertRows(
  doctorId: string,
  slots: WeekHalfSlotDraft[]
): { doctor_id: string; day_of_week: number; half_day: "am" | "pm"; is_available: boolean }[] {
  const map = new Map<string, boolean>();
  for (const s of slots) {
    if (
      !Number.isInteger(s.day_of_week) ||
      s.day_of_week < 0 ||
      s.day_of_week > 6 ||
      (s.half_day !== "am" && s.half_day !== "pm")
    ) {
      continue;
    }
    map.set(`${s.day_of_week}-${s.half_day}`, s.is_available);
  }
  const rows: {
    doctor_id: string;
    day_of_week: number;
    half_day: "am" | "pm";
    is_available: boolean;
  }[] = [];
  for (let d = 0; d < 7; d++) {
    for (const h of ["am", "pm"] as const) {
      rows.push({
        doctor_id: doctorId,
        day_of_week: d,
        half_day: h,
        is_available: map.get(`${d}-${h}`) ?? false
      });
    }
  }
  return rows;
}

function sortedItemsForInsert(items: WeekScheduleItemDraft[]): WeekScheduleItemDraft[] {
  return [...items].sort((a, b) => {
    if (a.day_of_week !== b.day_of_week) return a.day_of_week - b.day_of_week;
    if (a.half_day !== b.half_day) return (a.half_day === "am" ? 0 : 1) - (b.half_day === "am" ? 0 : 1);
    return a.title.localeCompare(b.title);
  });
}

/**
 * Replaces doctor week slots and schedule items in Supabase (used with Save profile).
 */
export async function persistDoctorWeekSchedule(
  supabase: SupabaseClient,
  doctorId: string,
  slots: WeekHalfSlotDraft[],
  items: WeekScheduleItemDraft[]
): Promise<{ error: string | null }> {
  const upsertRows = buildWeekSlotUpsertRows(doctorId, slots);
  const { error: slotErr } = await supabase.from("doctor_week_half_slots").upsert(upsertRows, {
    onConflict: "doctor_id,day_of_week,half_day"
  });
  if (slotErr) {
    return { error: slotErr.message };
  }

  const { error: delErr } = await supabase
    .from("doctor_schedule_items")
    .delete()
    .eq("doctor_id", doctorId);
  if (delErr) {
    return { error: delErr.message };
  }

  const ordered = sortedItemsForInsert(items);
  if (ordered.length === 0) {
    return { error: null };
  }

  const insertPayload = ordered.map((it, idx) => ({
    doctor_id: doctorId,
    day_of_week: it.day_of_week,
    half_day: it.half_day,
    title: it.title.trim(),
    details: (it.details ?? "").trim(),
    sort_order: idx
  }));

  const { error: insErr } = await supabase.from("doctor_schedule_items").insert(insertPayload);
  if (insErr) {
    return { error: insErr.message };
  }
  return { error: null };
}
