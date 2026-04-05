import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { OpportunitiesClient } from "./OpportunitiesClient";
import {
  mapOpportunityRows,
  OPPORTUNITY_LIST_SELECT,
  type OpportunityWithDoctorRow
} from "@/lib/opportunities";

export default async function OpportunitiesNearMePage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth?next=/opportunities");
  }

  let profileLat: number | null = null;
  let profileLng: number | null = null;
  let profileLocationLabel = "Not set";

  const { data: prof } = await supabase
    .from("profiles")
    .select("city,state,neighborhood,lat,lng")
    .eq("id", user.id)
    .maybeSingle();

  if (prof) {
    profileLat = prof.lat ?? null;
    profileLng = prof.lng ?? null;
    profileLocationLabel =
      [prof.neighborhood, prof.city, prof.state].filter(Boolean).join(", ") || "Not set";
  }

  const { data: oppRows, error } = await supabase
    .from("opportunities")
    .select(OPPORTUNITY_LIST_SELECT)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("opportunities fetch:", error.message);
  }

  const opportunities = mapOpportunityRows(
    (oppRows as OpportunityWithDoctorRow[] | null) ?? null,
    profileLat,
    profileLng
  );

  return (
    <OpportunitiesClient
      initialOpportunities={opportunities}
      profileLocationLabel={profileLocationLabel}
      profileLat={profileLat}
      profileLng={profileLng}
      fetchError={error?.message ?? null}
    />
  );
}
