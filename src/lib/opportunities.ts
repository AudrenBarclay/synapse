import { haversineMiles } from "@/lib/geo";
import type { Coordinates } from "@/types/core";
import type { Opportunity } from "@/types";

/** Use in `.select()` for listing opportunities with doctor profile fields. */
export const OPPORTUNITY_LIST_SELECT = `
  id,
  doctor_id,
  title,
  description,
  is_active,
  profiles (
    full_name,
    specialty,
    city,
    state,
    neighborhood,
    lat,
    lng,
    open_to_shadowing,
    availability_status,
    role
  )
` as const;

export type OpportunityDoctorEmbed = {
  full_name: string | null;
  specialty: string | null;
  city: string | null;
  state: string | null;
  neighborhood: string | null;
  lat: number | null;
  lng: number | null;
  open_to_shadowing: boolean | null;
  availability_status: string | null;
  role: string | null;
};

/** Row shape from `opportunities` + nested `profiles` (doctor). */
export type OpportunityWithDoctorRow = {
  id: string;
  doctor_id: string;
  title: string;
  description: string;
  is_active: boolean;
  profiles: OpportunityDoctorEmbed | OpportunityDoctorEmbed[] | null;
};

export function opportunityJoinToView(
  row: OpportunityWithDoctorRow,
  viewerLat: number | null,
  viewerLng: number | null
): Opportunity | null {
  const raw = row.profiles;
  const p = Array.isArray(raw) ? raw[0] : raw;
  if (!p || p.role !== "doctor") return null;

  const lat = p.lat;
  const lng = p.lng;
  const coords: Coordinates | null =
    lat != null && lng != null && !Number.isNaN(lat) && !Number.isNaN(lng)
      ? { lat, lng }
      : null;

  let distanceMiles: number | null = null;
  if (viewerLat != null && viewerLng != null && coords) {
    distanceMiles = haversineMiles(
      { lat: viewerLat, lng: viewerLng },
      coords
    );
  }

  const locationLabel =
    [p.neighborhood, p.city, p.state].filter(Boolean).join(", ") || "";

  const doctorOpen = p.open_to_shadowing ?? false;
  const notAvail = p.availability_status === "not_available";
  const available = row.is_active && doctorOpen && !notAvail;

  return {
    id: row.id,
    doctorId: row.doctor_id,
    title: row.title.trim(),
    doctorName: p.full_name?.trim() ?? "",
    specialty: p.specialty?.trim() ?? "",
    locationLabel: locationLabel || "—",
    distanceMiles,
    available,
    description: row.description.trim(),
    coordinates: coords
  };
}

export function mapOpportunityRows(
  rows: OpportunityWithDoctorRow[] | null | undefined,
  viewerLat: number | null,
  viewerLng: number | null
): Opportunity[] {
  if (!rows?.length) return [];
  const out: Opportunity[] = [];
  for (const r of rows) {
    const o = opportunityJoinToView(r, viewerLat, viewerLng);
    if (o) out.push(o);
  }
  return out;
}
