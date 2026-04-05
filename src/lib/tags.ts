/** Split comma/newline-separated user input into a clean string array. */
export function parseTagList(input: string): string[] {
  if (input == null || typeof input !== "string") return [];
  return input
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function joinTagList(tags: string[] | null | undefined): string {
  if (!Array.isArray(tags)) return "";
  return tags.filter((t): t is string => typeof t === "string").join(", ");
}

/**
 * Coerce Supabase/json values into string[] (null, wrong types, nested junk safe).
 */
export function coerceStringArray(value: unknown): string[] {
  if (value == null) return [];
  if (Array.isArray(value)) {
    const out: string[] = [];
    for (const item of value) {
      if (item == null) continue;
      if (typeof item === "string") {
        const t = item.trim();
        if (t) out.push(t);
        continue;
      }
      if (typeof item === "number" || typeof item === "boolean") {
        out.push(String(item));
        continue;
      }
    }
    return out;
  }
  if (typeof value === "string") {
    return parseTagList(value);
  }
  return [];
}

export function joinTagListFromUnknown(value: unknown): string {
  return joinTagList(coerceStringArray(value));
}

/**
 * `profiles.location` should be text; JSON/object values are flattened safely for the form.
 */
export function coerceLocationText(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (typeof value === "object" && !Array.isArray(value) && value !== null) {
    const o = value as Record<string, unknown>;
    const parts = [o.city, o.state, o.neighborhood, o.text, o.label, o.name]
      .filter((x): x is string => typeof x === "string" && x.trim().length > 0)
      .map((x) => x.trim());
    if (parts.length) return parts.join(", ");
    return "";
  }
  return "";
}

/** Lat/lng from DB may be number, string, or null. */
export function formatCoordForInput(value: unknown): string {
  if (value == null || value === "") return "";
  const n = typeof value === "number" ? value : Number.parseFloat(String(value).trim());
  return Number.isFinite(n) ? String(n) : "";
}
