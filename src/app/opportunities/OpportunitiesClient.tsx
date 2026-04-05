"use client";

import * as React from "react";
import { SearchFilterBar, type OpportunityFilters } from "@/components/search/SearchFilterBar";
import { OpportunityCard } from "@/components/cards/OpportunityCard";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatMiles } from "@/utils/format";
import { Button } from "@/components/ui/Button";
import type { Opportunity } from "@/types";

function uniq(arr: string[]) {
  return Array.from(new Set(arr));
}

export function OpportunitiesClient({
  initialOpportunities,
  profileLocationLabel,
  profileLat,
  profileLng,
  fetchError
}: {
  initialOpportunities: Opportunity[];
  profileLocationLabel: string;
  profileLat: number | null;
  profileLng: number | null;
  fetchError: string | null;
}) {
  const [filters, setFilters] = React.useState<OpportunityFilters>({
    query: "",
    specialty: "",
    maxDistance: 25,
    availability: "any"
  });

  const [geoLat, setGeoLat] = React.useState<number | null>(null);
  const [geoLng, setGeoLng] = React.useState<number | null>(null);
  const [geoStatus, setGeoStatus] = React.useState<string | null>(null);

  const viewerLat = geoLat ?? profileLat;
  const viewerLng = geoLng ?? profileLng;

  const specialties = uniq(
    initialOpportunities.map((o) => o.specialty).filter(Boolean)
  ).sort();

  const hasViewer = viewerLat != null && viewerLng != null;

  const filtered = initialOpportunities
    .filter((o) => (filters.specialty ? o.specialty === filters.specialty : true))
    .filter((o) => {
      if (!hasViewer) return true;
      if (o.distanceMiles == null) return true;
      return o.distanceMiles <= filters.maxDistance;
    })
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
        o.title.toLowerCase().includes(q) ||
        o.description.toLowerCase().includes(q) ||
        o.doctorName.toLowerCase().includes(q) ||
        o.specialty.toLowerCase().includes(q) ||
        o.locationLabel.toLowerCase().includes(q)
      );
    });

  const mapItems = filtered.filter((o) => o.coordinates != null);

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus("Geolocation is not supported in this browser.");
      return;
    }
    setGeoStatus("Locating…");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoLat(pos.coords.latitude);
        setGeoLng(pos.coords.longitude);
        setGeoStatus("Using your current location for distance.");
      },
      () => {
        setGeoStatus("Could not read location. Check browser permissions.");
      },
      { enableHighAccuracy: true, timeout: 10_000 }
    );
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      {fetchError ? (
        <div
          className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
          role="alert"
        >
          Could not load opportunities from the database. Confirm the{" "}
          <code className="rounded bg-amber-100/80 px-1">opportunities</code> table exists and RLS
          allows you to read active listings. ({fetchError})
        </div>
      ) : null}

      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-lg font-semibold text-slate-900">Opportunities Near Me</div>
          <div className="text-sm text-slate-600">
            Profile location:{" "}
            <span className="font-medium text-slate-900">{profileLocationLabel}</span>
            {viewerLat != null && viewerLng != null ? (
              <span className="ml-1 text-slate-500">
                · distances use{" "}
                {geoLat != null ? "your device location" : "profile coordinates"}.
              </span>
            ) : (
              <span className="ml-1 text-slate-500">
                · add coordinates to your profile or use device location for distances.
              </span>
            )}
          </div>
          {geoStatus ? <div className="mt-1 text-xs text-slate-600">{geoStatus}</div> : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={useMyLocation}>
            Use device location
          </Button>
          <Badge variant="brand">Explore</Badge>
        </div>
      </div>

      {!fetchError && initialOpportunities.length === 0 ? (
        <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-8 text-center text-sm text-slate-600">
          <p className="font-medium text-slate-800">No active opportunities yet</p>
          <p className="mt-2">
            When physicians post shadowing listings, they will appear here. Doctors can add listings
            from the doctor dashboard.
          </p>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[1fr_420px]">
        <div className="space-y-4">
          <SearchFilterBar value={filters} onChange={setFilters} specialties={specialties} />

          <Card className="overflow-hidden shadow-card">
            <div className="border-b border-slate-200/70 bg-white px-5 py-4">
              <div className="text-sm font-semibold text-slate-900">Map</div>
              <div className="text-sm text-slate-600">
                Pins use each doctor&apos;s saved profile coordinates. Listings without coordinates
                still appear in the list on the right.
              </div>
            </div>
            <div className="relative h-[520px] bg-[linear-gradient(180deg,#f8fafc,white)]">
              <div className="absolute inset-0 opacity-80 [background-image:radial-gradient(rgba(15,23,42,0.06)_1px,transparent_1px)] [background-size:18px_18px]" />

              <div className="pointer-events-none absolute left-[10%] top-[20%] h-1 w-[65%] rounded-full bg-slate-200/80" />
              <div className="pointer-events-none absolute left-[20%] top-[55%] h-1 w-[70%] rounded-full bg-slate-200/80" />
              <div className="pointer-events-none absolute left-[55%] top-[10%] h-[80%] w-1 rounded-full bg-slate-200/80" />

              {mapItems.map((o) => {
                const c = o.coordinates!;
                const left = `${20 + (c.lng + 84.45) * 220}%`;
                const top = `${20 + (33.9 - c.lat) * 220}%`;
                return (
                  <div
                    key={o.id}
                    className="absolute"
                    style={{ left, top }}
                    title={`${o.doctorName}${o.specialty ? ` · ${o.specialty}` : ""}`}
                  >
                    <div className="relative">
                      <div
                        className={[
                          "h-10 w-10 rounded-full shadow-soft ring-2 ring-white",
                          o.available ? "bg-brand-600" : "bg-slate-400"
                        ].join(" ")}
                      />
                      <div
                        className={[
                          "absolute left-1/2 top-9 h-0 w-0 -translate-x-1/2 border-x-[10px] border-t-[14px] border-x-transparent",
                          o.available ? "border-t-brand-600" : "border-t-slate-400"
                        ].join(" ")}
                      />
                      <div className="absolute inset-0 grid place-items-center text-xs font-semibold text-white">
                        {(o.specialty.trim()[0] || "·").toUpperCase()}
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="absolute bottom-4 left-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-soft">
                Showing <span className="font-semibold text-slate-900">{filtered.length}</span>{" "}
                listing{filtered.length === 1 ? "" : "s"}
                {mapItems.length !== filtered.length ? (
                  <span className="text-slate-500">
                    {" "}
                    ({mapItems.length} with map coordinates)
                  </span>
                ) : null}
                {hasViewer ? (
                  <>
                    {" "}
                    within <span className="font-semibold text-slate-900">{filters.maxDistance}</span>{" "}
                    miles (where distance is known)
                  </>
                ) : (
                  " — set profile or device location for distance filters"
                )}
                .
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="shadow-soft">
            <CardContent className="space-y-2">
              <div className="text-sm font-semibold text-slate-900">Nearby listings</div>
              <div className="text-sm text-slate-600">Filtered by distance and specialty.</div>
              {filtered.length === 0 && initialOpportunities.length > 0 ? (
                <p className="mt-2 text-sm text-slate-500">No listings match your filters.</p>
              ) : null}
              <div className="mt-3 grid gap-2 text-sm text-slate-700">
                {filtered
                  .slice()
                  .sort((a, b) => {
                    const da = a.distanceMiles ?? Infinity;
                    const db = b.distanceMiles ?? Infinity;
                    return da - db;
                  })
                  .map((o) => (
                    <div
                      key={o.id}
                      className="rounded-2xl border border-slate-200/70 bg-white p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-slate-900">
                            {o.title || "Shadowing listing"}
                          </div>
                          <div className="truncate text-sm text-slate-600">
                            {o.doctorName}
                            {o.specialty ? ` · ${o.specialty}` : ""} ·{" "}
                            {hasViewer && o.distanceMiles != null
                              ? formatMiles(o.distanceMiles)
                              : "—"}
                          </div>
                          <div className="mt-1 flex flex-wrap gap-2">
                            {o.available ? (
                              <Badge variant="mint">Available</Badge>
                            ) : (
                              <Badge variant="slate">Unavailable</Badge>
                            )}
                          </div>
                        </div>
                        <span
                          className={[
                            "mt-1.5 h-2 w-2 rounded-full",
                            o.available ? "bg-mint-500" : "bg-slate-400"
                          ].join(" ")}
                        />
                      </div>
                    </div>
                  ))}
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
