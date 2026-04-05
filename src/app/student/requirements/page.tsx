import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { RequirementsClient } from "./RequirementsClient";
import { Button } from "@/components/ui/Button";

export default async function StudentRequirementsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "student") {
    redirect("/doctor");
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Forms &amp; prerequisites
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Upload required documents before requesting a match with a physician.
          </p>
        </div>
        <Link href="/student/edit">
          <Button variant="secondary">Edit profile</Button>
        </Link>
      </div>
      <RequirementsClient userId={user.id} />
    </main>
  );
}
