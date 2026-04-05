import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function Feature({
  title,
  description
}: {
  title: string;
  description: string;
}) {
  return (
    <Card className="shadow-soft">
      <CardContent className="space-y-2">
        <div className="text-sm font-semibold text-slate-900">{title}</div>
        <p className="text-sm text-slate-600">{description}</p>
      </CardContent>
    </Card>
  );
}

export default async function HomePage() {
  const supabase = await createServerSupabaseClient();
  const { count: doctorCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "doctor");

  const { count: listingCount } = await supabase
    .from("opportunities")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  const doctorsOnNetwork = doctorCount ?? 0;
  const activeListings = listingCount ?? 0;

  return (
    <main>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_10%,rgba(59,130,246,0.18),rgba(16,185,129,0.06),transparent_70%)]" />
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-2 md:items-center md:py-20">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="brand">Pre‑med networking</Badge>
              <Badge variant="mint">Shadowing opportunities</Badge>
              <Badge variant="slate">Messaging + booking</Badge>
            </div>
            <h1 className="text-balance text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
              Meet physicians. Find shadowing. Build a professional profile.
            </h1>
            <p className="text-pretty text-base leading-relaxed text-slate-600 md:text-lg">
              Synapse helps pre‑med students discover local shadowing opportunities and connect
              with doctors through a clean, trusted networking experience — similar to LinkedIn,
              built for mentorship and shadowing.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/auth?mode=signup" className="w-full sm:w-auto">
                <Button className="w-full" size="lg">
                  Sign up
                </Button>
              </Link>
              <Link href="/auth" className="w-full sm:w-auto">
                <Button className="w-full" variant="secondary" size="lg">
                  Log in
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-slate-600">
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-mint-500" />
                Student & doctor profiles
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-brand-600" />
                Opportunities near me (map + distance)
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-slate-400" />
                Messages & intro booking
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-card">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-slate-900">Network snapshot</div>
                  <div className="text-sm text-slate-600">
                    Live counts from your database (doctors and active listings)
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="brand">{doctorsOnNetwork} doctors</Badge>
                  <Badge variant="mint">{activeListings} active listings</Badge>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                <div className="text-sm font-medium text-slate-800">
                  {doctorsOnNetwork === 0 && activeListings === 0
                    ? "The network starts empty — only real sign-ups appear here."
                    : `${doctorsOnNetwork} doctor profile${doctorsOnNetwork === 1 ? "" : "s"}, ${activeListings} active shadowing listing${activeListings === 1 ? "" : "s"}`}
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  These numbers are queried from your Supabase project. Profiles and listings stay
                  blank until someone signs in and adds them.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  <Link href="/auth?mode=signup">
                    <Button size="sm">Create account</Button>
                  </Link>
                  <Link href="/opportunities">
                    <Button variant="secondary" size="sm">
                      Browse opportunities
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            <div className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-brand-200/50 blur-3xl" />
            <div className="pointer-events-none absolute -top-10 -left-10 h-40 w-40 rounded-full bg-mint-200/50 blur-3xl" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14">
        <div className="grid gap-8 md:grid-cols-3">
          <Feature
            title="Find shadowing opportunities"
            description="Browse nearby options with specialties and distance — use your profile location or device location."
          />
          <Feature
            title="Connect with doctors"
            description="Message physicians from profiles in a professional inbox backed by your database."
          />
          <Feature
            title="Build a pre‑med profile"
            description="Showcase hours, major, year, interests, and research — doctors show availability and shadowing preferences."
          />
        </div>
      </section>
    </main>
  );
}
