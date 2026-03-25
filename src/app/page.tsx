import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

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

export default function HomePage() {
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
              Synapse helps pre‑med students discover local shadowing
              opportunities and connect with doctors through a clean, trusted
              networking experience.
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
                Trusted, minimal UI
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-brand-600" />
                Nearby discovery
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-slate-400" />
                Clear scheduling
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-card">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-slate-900">
                    Suggested matches
                  </div>
                  <div className="text-sm text-slate-600">
                    Based on your location & interests
                  </div>
                </div>
                <Badge variant="brand">Demo</Badge>
              </div>

              <div className="mt-5 grid gap-3">
                {[
                  {
                    name: "Dr. Maya Patel",
                    meta: "Cardiology · Emory Midtown",
                    note: "Open to shadowing"
                  },
                  {
                    name: "Dr. James Chen",
                    meta: "Emergency Medicine · Grady",
                    note: "1 slot this week"
                  },
                  {
                    name: "Dr. Sofia Ramirez",
                    meta: "Pediatrics · Children’s Healthcare",
                    note: "Responds quickly"
                  }
                ].map((d) => (
                  <div
                    key={d.name}
                    className="flex items-start justify-between rounded-2xl border border-slate-200/70 bg-white p-4 shadow-soft transition hover:shadow-card"
                  >
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-slate-900">
                        {d.name}
                      </div>
                      <div className="text-sm text-slate-600">{d.meta}</div>
                      <div className="text-xs text-slate-500">{d.note}</div>
                    </div>
                    <Link href="/doctors/d-101">
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <Link href="/student">
                  <Button variant="secondary" className="w-full">
                    Student dashboard
                  </Button>
                </Link>
                <Link href="/doctor">
                  <Button variant="secondary" className="w-full">
                    Doctor dashboard
                  </Button>
                </Link>
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
            description="Browse nearby shadowing options with availability, specialties, and distance—designed for fast decisions."
          />
          <Feature
            title="Connect with doctors"
            description="Message physicians in a professional interface built for clear, respectful outreach."
          />
          <Feature
            title="Build a pre‑med profile"
            description="Showcase hours, interests, research, and goals with clean profile sections that read like a modern networking app."
          />
        </div>
      </section>
    </main>
  );
}

