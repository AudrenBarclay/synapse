import Link from "next/link";
import { Sidebar } from "@/components/layout/Sidebar";
import { StatCard } from "@/components/ui/StatCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { DoctorProfileCard } from "@/components/cards/ProfileCard";
import { OpportunityCard } from "@/components/cards/OpportunityCard";
import { Button } from "@/components/ui/Button";
import { doctors, opportunities, students } from "@/data";

export default function StudentDashboardPage() {
  const me = students[0];
  const suggestedDoctors = doctors.slice(0, 3);
  const recommended = opportunities.slice(0, 3);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex gap-6">
        <Sidebar
          title="Student"
          currentPath="/student"
          items={[
            { label: "Dashboard", href: "/student" },
            { label: "Opportunities Near Me", href: "/opportunities", badge: "New" },
            { label: "Messages", href: "/messages", badge: "1" },
            { label: "My Profile", href: `/students/${me.id}` }
          ]}
        />

        <div className="min-w-0 flex-1 space-y-6">
          <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-card">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div className="space-y-1">
                <div className="text-sm font-semibold text-slate-900">
                  Welcome back, {me.name.split(" ")[0]}
                </div>
                <div className="text-sm text-slate-600">{me.headline}</div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href="/messages">
                  <Button>Open messages</Button>
                </Link>
                <Link href="/opportunities">
                  <Button variant="secondary">Find opportunities</Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <StatCard label="Shadowing hours" value={`${me.shadowingHours}`} tone="brand" />
            <StatCard label="Clinical hours" value={`${me.clinicalHours}`} tone="mint" />
            <StatCard
              label="Saved doctors"
              value={`${me.savedDoctors.length}`}
              tone="slate"
            />
            <StatCard label="Nearby opportunities" value={`${recommended.length}`} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-3">
              <SectionHeader
                title="Suggested doctors"
                subtitle="Based on your interests and location"
                right={
                  <Link href="/opportunities">
                    <Button variant="ghost" size="sm">
                      Explore
                    </Button>
                  </Link>
                }
              />
              <div className="grid gap-3">
                {suggestedDoctors.map((d) => (
                  <DoctorProfileCard key={d.id} doctor={d} />
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <SectionHeader
                title="Recommended opportunities"
                subtitle="Shortlist options that fit your schedule"
              />
              <div className="grid gap-3">
                {recommended.map((o) => (
                  <OpportunityCard key={o.id} opportunity={o} />
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-soft">
            <SectionHeader
              title="Next steps"
              subtitle="A simple checklist to keep momentum."
            />
            <ul className="mt-4 grid gap-2 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-brand-600" />
                Save 3 doctors you’re interested in and message 1 with a concise intro.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-mint-500" />
                Update your profile headline and add 2–3 interest tags.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-slate-400" />
                Explore the map view for nearby opportunities and filter by specialty.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}

