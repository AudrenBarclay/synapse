import type { AvailabilityStatus, ID, Location } from "@/types/core";

export type MeetingSlot = {
  id: ID;
  startIso: string; // ISO datetime
  endIso: string; // ISO datetime
  isBooked?: boolean;
};

export type DoctorProfile = {
  id: ID;
  role: "doctor";
  name: string;
  profilePicture: string | null;
  specialty: string;
  organization: string;
  headline: string;
  bio: string;
  location: Location;
  availableForShadowing: boolean;
  availabilityStatus: AvailabilityStatus;
  meetingSlots: MeetingSlot[];
  interests: string[];
  areasOfFocus: string[];
};

