import type { ID, Location } from "@/types/core";

export type StudentProfile = {
  id: ID;
  role: "student";
  name: string;
  profilePicture: string | null;
  headline: string;
  year: "Freshman" | "Sophomore" | "Junior" | "Senior" | "Post‑bacc";
  major: string;
  medicalInterest: string;
  shadowingHours: number;
  clinicalHours: number;
  volunteerHours: number;
  researchExperience: string;
  bio: string;
  location: Location;
  interests: string[];
  skills: string[];
  savedDoctors: ID[];
};

