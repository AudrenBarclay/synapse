export type ID = string;

export type UserRole = "student" | "doctor";

export type AvailabilityStatus = "available" | "limited" | "not_available";

export type Coordinates = {
  lat: number;
  lng: number;
};

export type Location = {
  /** Maps to `profiles.location` in Supabase (freeform: city, region, campus, etc.). */
  text: string;
  /** Set when the user has saved latitude/longitude on their profile. */
  coordinates: Coordinates | null;
};

