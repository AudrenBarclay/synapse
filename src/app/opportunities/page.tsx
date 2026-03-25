"use client";

import * as React from "react";
import { opportunities, students, doctors } from "@/data";
import { SearchFilterBar, type OpportunityFilters } from "@/components/search/SearchFilterBar";
import { OpportunityCard } from "@/components/cards/OpportunityCard";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatMiles } from "@/utils/format";

function uniq<T>(arr: T[]) {
  return Array.from(new Set(arr));
}

export default function OpportunitiesNearMePage() {
  const me = students[0];
  const specialties = uniq(opportunities.map((o) => o.specialty)).sort();

  const [filters, setFilters] = React.useState<OpportunityFilters>({
    query: "",
    specialty: "",
    maxDistance: 10,
    availability: "any"
  });

  const filtered = opportunities
    .filter((o) => (filters.specialty ? o.specialty === filters.specialty : true))
    .filter((o) => o.distanceMiles <= filters.maxDistance)
    .filter((o) =>
      filters.availability === "any"
        ? true
        : filters.availability === "available"
          ? o.available
          : !o.available
    )
    .filter((o) => {
      const q = filters.query.trim().toLowerCase();
      if (!q) return true;
      return (
        o.doctorName.toLowerCase().includes(q) ||
        o.specialty.toLowerCase().includes(q) ||
        o.locationLabel.toLowerCase().includes(q)
      );
    });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-lg font-semibold text-slate-900">
            Opportunities Near Me
          </div>
          <div className="text-sm text-slate-600">
            Using profile location:{" "}
            <span className="font-medium text-slate-900">
              {me.location.neighborhood ?? me.location.city}, {me.location.state}
            </span>{" "}
            (mock)
          </div>
        </div>
        <Badge variant="brand">Map-style demo</Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_420px]">
        <div className="space-y-4">
          <SearchFilterBar value={filters} onChange={setFilters} specialties={specialties} />

          <Card className="overflow-hidden shadow-card">
            <div className="border-b border-slate-200/70 bg-white px-5 py-4">
              <div className="text-sm font-semibold text-slate-900">Map</div>
              <div className="text-sm text-slate-600">
                Styled placeholder map with pins (mock coordinates).
              </div>
            </div>
            <div className="relative h-[520px] bg-[linear-gradient(180deg,#f8fafc,white)]">
              <div className="absolute inset-0 opacity-80 [background-image:radial-gradient(rgba(15,23,42,0.06)_1px,transparent_1px)] [background-size:18px_18px]" />

              {/* faux map roads */}
              <div className="pointer-events-none absolute left-[10%] top-[20%] h-1 w-[65%] rounded-full bg-slate-200/80" />
              <div className="pointer-events-none absolute left-[20%] top-[55%] h-1 w-[70%] rounded-full bg-slate-200/80" />
              <div className="pointer-events-none absolute left-[55%] top-[10%] h-[80%] w-1 rounded-full bg-slate-200/80" />

              {/* pins */}
              {filtered.map((o) => {
                const left = `${20 + (o.coordinates.lng + 84.45) * 220}%`;
                const top = `${20 + (33.9 - o.coordinates.lat) * 220}%`;
                return (
                  <div
                    key={o.id}
                    className="absolute"
                    style={{ left, top }}
                    title={`${o.doctorName} · ${o.specialty}`}
                  >
                    <div className="relative">
                      <div
                        className={[
                          "h-10 w-10 rounded-full shadow-soft ring-2 ring-white",
                          o.available ? "bg-brand-600" : "bg-slate-400"
                        ].join(" ")}
                      />
                      <div className="absolute left-1/2 top-9 h-0 w-0 -translate-x-1/2 border-x-[10px] border-t-[14px] border-x-transparent border-t-brand-600/0" />
                      <div
                        className={[
                          "absolute left-1/2 top-9 h-0 w-0 -translate-x-1/2 border-x-[10px] border-t-[14px] border-x-transparent",
                          o.available ? "border-t-brand-600" : "border-t-slate-400"
                        ].join(" ")}
                      />
                      <div className="absolute inset-0 grid place-items-center text-xs font-semibold text-white">
                        {o.specialty.split(" ")[0][0]}
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="absolute bottom-4 left-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-soft">
                Showing <span className="font-semibold text-slate-900">{filtered.length}</span>{" "}
                results within <span className="font-semibold text-slate-900">{filters.maxDistance}</span>{" "}
                miles.
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="shadow-soft">
            <CardContent className="space-y-2">
              <div className="text-sm font-semibold text-slate-900">Nearby listings</div>
              <div className="text-sm text-slate-600">
                Filtered results sorted by distance.
              </div>
              <div className="mt-3 grid gap-2 text-sm text-slate-700">
                {filtered
                  .slice()
                  .sort((a, b) => a.distanceMiles - b.distanceMiles)
                  .map((o) => {
                    const doc = doctors.find((d) => d.id === o.doctorId);
                    return (
                      <div
                        key={o.id}
                        className="rounded-2xl border border-slate-200/70 bg-white p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-slate-900">
                              {o.doctorName}
                            </div>
                            <div className="truncate text-sm text-slate-600">
                              {o.specialty} · {formatMiles(o.distanceMiles)}
                            </div>
                            <div className="mt-1 flex flex-wrap gap-2">
                              {o.available ? (
                                <Badge variant="mint">Available</Badge>
                              ) : (
                                <Badge variant="slate">Waitlist</Badge>
                              )}
                              {doc?.availableForShadowing ? (
                                <Badge variant="brand">Open to shadowing</Badge>
                              ) : (
                                <Badge variant="slate">Not open</Badge>
                              )}
                            </div>
                          </div>
                          <span
                            className={[
                              "h-2 w-2 rounded-full mt-1.5",
                              o.available ? "bg-mint-500" : "bg-slate-400"
                            ].join(" ")}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-3">
            {filtered.map((o) => (
              <OpportunityCard key={o.id} opportunity={o} compact />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

