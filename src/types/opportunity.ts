import type { Coordinates, ID } from "@/types/core";

export type Opportunity = {
  id: ID;
  doctorId: ID;
  title: string;
  doctorName: string;
  specialty: string;
  locationLabel: string;
  /** Null when viewer or doctor has no coordinates to compute distance. */
  distanceMiles: number | null;
  available: boolean;
  description: string;
  /** Null when the doctor profile has no saved coordinates (excluded from map pins). */
  coordinates: Coordinates | null;
};

