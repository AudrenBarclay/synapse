import Link from "next/link";
import { Sidebar } from "@/components/layout/Sidebar";
import { StatCard } from "@/components/ui/StatCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StudentProfileCard } from "@/components/cards/ProfileCard";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { conversations, doctors, messages, students } from "@/data";
import { formatAvailability } from "@/utils/format";

export default function DoctorDashboardPage() {
  const me = doctors[0];
  const av = formatAvailability(me.availabilityStatus);
  const interestedStudents = students.slice(0, 2);
  const inboxPreview = conversations.slice(0, 2).map((c) => ({
    convo: c,
    last: messages
      .filter((m) => m.conversationId === c.id)
      .slice(-1)[0]
  }));

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex gap-6">
        <Sidebar
          title="Doctor"
          currentPath="/doctor"
          items={[
            { label: "Dashboard", href: "/doctor" },
            { label: "Messages", href: "/messages", badge: "1" },
            { label: "My Profile", href: `/doctors/${me.id}` },
            { label: "Opportunities Near Me", href: "/opportunities" }
          ]}
        />

        <div className="min-w-0 flex-1 space-y-6">
          <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-card">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div className="space-y-1">
                <div className="text-sm font-semibold text-slate-900">
                  Welcome, {me.name}
                </div>
                <div className="text-sm text-slate-600">
                  {me.specialty} · {me.organization}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant={av.tone}>{av.label}</Badge>
                {me.availableForShadowing ? (
                  <Badge variant="mint">Open to students</Badge>
                ) : (
                  <Badge variant="slate">Shadowing paused</Badge>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <StatCard label="Students interested" value={`${interestedStudents.length}`} />
            <StatCard label="Upcoming meetings" value="2" tone="mint" />
            <StatCard label="Availability" value={av.label} tone={av.tone} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-3">
              <SectionHeader
                title="Interested students"
                subtitle="Recent outreach requests"
                right={
                  <Link href="/messages">
                    <Button variant="ghost" size="sm">
                      View inbox
                    </Button>
                  </Link>
                }
              />
              <div className="grid gap-3">
                {interestedStudents.map((s) => (
                  <StudentProfileCard key={s.id} student={s} />
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <SectionHeader
                title="Incoming messages"
                subtitle="Quick preview of your latest conversations"
              />
              <div className="grid gap-3">
                {inboxPreview.map(({ convo, last }) => (
                  <Card key={convo.id} className="transition hover:shadow-card">
                    <CardContent className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold text-slate-900">
                          Conversation {convo.id.toUpperCase()}
                        </div>
                        {convo.unreadCount ? (
                          <Badge variant="brand">{convo.unreadCount} unread</Badge>
                        ) : (
                          <Badge variant="slate">Up to date</Badge>
                        )}
                      </div>
                      <div className="text-sm text-slate-600">
                        {last?.body ?? convo.lastMessagePreview}
                      </div>
                      <div className="flex justify-end">
                        <Link href="/messages">
                          <Button size="sm" variant="secondary">
                            Reply
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-soft">
            <SectionHeader
              title="Manage shadowing availability"
              subtitle="This is a mock control panel for the demo."
              right={<Badge variant="brand">Local state</Badge>}
            />
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-slate-600">
                Update your status to help students understand response expectations.
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary">Set available</Button>
                <Button variant="secondary">Set limited</Button>
                <Button variant="secondary">Pause shadowing</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

