import type { Coordinates } from "@/types/core";

const EARTH_MI = 3958.8;

export function haversineMiles(a: Coordinates, b: Coordinates): number {
  const rlat1 = (a.lat * Math.PI) / 180;
  const rlat2 = (b.lat * Math.PI) / 180;
  const dlat = rlat2 - rlat1;
  const dlng = ((b.lng - a.lng) * Math.PI) / 180;
  const h =
    Math.sin(dlat / 2) ** 2 +
    Math.cos(rlat1) * Math.cos(rlat2) * Math.sin(dlng / 2) ** 2;
  return EARTH_MI * 2 * Math.asin(Math.min(1, Math.sqrt(h)));
}
