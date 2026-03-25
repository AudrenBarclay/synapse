import * as React from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

export type OpportunityFilters = {
  query: string;
  specialty: string;
  maxDistance: number;
  availability: "any" | "available" | "waitlist";
};

export function SearchFilterBar({
  value,
  onChange,
  specialties
}: {
  value: OpportunityFilters;
  onChange: (next: OpportunityFilters) => void;
  specialties: string[];
}) {
  return (
    <Card className="shadow-soft">
      <CardContent className="grid gap-3 md:grid-cols-12">
        <div className="md:col-span-5">
          <Input
            label="Search"
            placeholder="Search opportunities near me"
            value={value.query}
            onChange={(e) => onChange({ ...value, query: e.target.value })}
          />
        </div>
        <div className="md:col-span-3">
          <label className="text-sm font-medium text-slate-800">Specialty</label>
          <select
            className="mt-1.5 h-[42px] w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-600/30 focus:border-brand-600"
            value={value.specialty}
            onChange={(e) => onChange({ ...value, specialty: e.target.value })}
          >
            <option value="">All specialties</option>
            {specialties.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="text-sm font-medium text-slate-800">Distance</label>
          <select
            className="mt-1.5 h-[42px] w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-600/30 focus:border-brand-600"
            value={String(value.maxDistance)}
            onChange={(e) =>
              onChange({ ...value, maxDistance: Number(e.target.value) })
            }
          >
            {[5, 10, 20, 50].map((d) => (
              <option key={d} value={d}>
                Within {d} mi
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="text-sm font-medium text-slate-800">Availability</label>
          <select
            className="mt-1.5 h-[42px] w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-600/30 focus:border-brand-600"
            value={value.availability}
            onChange={(e) =>
              onChange({
                ...value,
                availability: e.target.value as OpportunityFilters["availability"]
              })
            }
          >
            <option value="any">Any</option>
            <option value="available">Available</option>
            <option value="waitlist">Waitlist</option>
          </select>
        </div>
        <div className="md:col-span-12 flex justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              onChange({
                query: "",
                specialty: "",
                maxDistance: 10,
                availability: "any"
              })
            }
          >
            Reset filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

