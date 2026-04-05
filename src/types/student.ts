import type { ID, Location } from "@/types/core";

export type StudentYear = "Freshman" | "Sophomore" | "Junior" | "Senior" | "Post‑bacc";

export type StudentProfile = {
  id: ID;
  role: "student";
  /** Empty until the user sets full_name in the database. */
  name: string;
  profilePicture: string | null;
  headline: string;
  /** Null until the user selects a year in student_hours. */
  year: StudentYear | null;
  major: string;
  medicalInterest: string;
  shadowingHours: number;
  clinicalHours: number;
  volunteerHours: number;
  researchExperience: string;
  /** Up to 200 words; shown to doctors reviewing your profile. */
  shadowingGoals: string;
  previousShadowingExperience: string;
  bio: string;
  location: Location;
  interests: string[];
  skills: string[];
  savedDoctors: ID[];
};

