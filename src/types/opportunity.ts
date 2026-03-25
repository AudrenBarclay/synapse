import type { Coordinates, ID } from "@/types/core";

export type Opportunity = {
  id: ID;
  doctorId: ID;
  doctorName: string;
  specialty: string;
  locationLabel: string;
  distanceMiles: number;
  available: boolean;
  description: string;
  coordinates: Coordinates;
};

