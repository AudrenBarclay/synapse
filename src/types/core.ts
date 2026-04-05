export type ID = string;

export type UserRole = "student" | "doctor";

export type AvailabilityStatus = "available" | "limited" | "not_available";

export type Coordinates = {
  lat: number;
  lng: number;
};

export type Location = {
  city: string;
  state: string;
  neighborhood?: string;
  /** Set when the user has saved latitude/longitude on their profile. */
  coordinates: Coordinates | null;
};

