/**
 * Doctor weekly AM/PM grid + labeled items stored in profiles.availability_schedule (jsonb).
 * Shape v1: { slots: WeekHalfSlotDraft[], items: WeekScheduleItemDraft[] }
 */

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

export type ParsedAvailabilitySchedule = {
  slots: WeekHalfSlotDraft[];
  items: WeekScheduleItemDraft[];
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
 * so the client can key them until the next save reloads ids from JSON.
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

/**
 * Read profiles.availability_schedule (or any jsonb). Null / non-object / legacy → empty schedule.
 */
export function parseAvailabilitySchedule(
  raw: unknown,
  generateId: () => string
): ParsedAvailabilitySchedule {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) {
    return { slots: [], items: [] };
  }
  const o = raw as Record<string, unknown>;
  const slots = normalizeWeekHalfSlots(o.slots);
  const items = normalizeWeekScheduleItems(o.items, generateId);
  return { slots, items };
}

function sortedItemsForJson(items: WeekScheduleItemDraft[]): WeekScheduleItemDraft[] {
  return [...items].sort((a, b) => {
    if (a.day_of_week !== b.day_of_week) return a.day_of_week - b.day_of_week;
    if (a.half_day !== b.half_day) return (a.half_day === "am" ? 0 : 1) - (b.half_day === "am" ? 0 : 1);
    return a.title.localeCompare(b.title);
  });
}

/** Plain JSON value for profiles.availability_schedule (jsonb). */
export function serializeAvailabilitySchedule(
  slots: WeekHalfSlotDraft[],
  items: WeekScheduleItemDraft[]
): { slots: WeekHalfSlotDraft[]; items: WeekScheduleItemDraft[] } {
  const ordered = sortedItemsForJson(items);
  return {
    slots: slots.map((s) => ({
      day_of_week: s.day_of_week,
      half_day: s.half_day,
      is_available: s.is_available
    })),
    items: ordered.map((it) => ({
      id: it.id,
      day_of_week: it.day_of_week,
      half_day: it.half_day,
      title: it.title.trim(),
      details: (it.details ?? "").trim()
    }))
  };
}
