import * as React from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { MeetingSlot } from "@/types";
import { formatTimeRange } from "@/utils/format";

export function BookingWidget({
  slots,
  onBook
}: {
  slots: MeetingSlot[];
  onBook?: (slotId: string) => void;
}) {
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [confirmedId, setConfirmedId] = React.useState<string | null>(null);

  const selected = slots.find((s) => s.id === selectedId) ?? null;
  const availableSlots = slots.filter((s) => !s.isBooked);

  return (
    <Card className="shadow-soft">
      <CardContent className="space-y-4">
        <SectionHeader
          title="Book a quick intro"
          subtitle="Select a time to confirm a short (20 min) intro meeting."
          right={<Badge variant="brand">Intro call</Badge>}
        />

        {availableSlots.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            No open slots right now. Check back soon.
          </div>
        ) : (
          <div className="grid gap-2">
            {availableSlots.map((slot) => {
              const active = slot.id === selectedId;
              return (
                <button
                  key={slot.id}
                  type="button"
                  className={[
                    "flex items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm transition",
                    active
                      ? "border-brand-200 bg-brand-50 ring-1 ring-brand-100"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  ].join(" ")}
                  onClick={() => {
                    setSelectedId(slot.id);
                    setConfirmedId(null);
                  }}
                >
                  <span className="font-medium text-slate-900">
                    {formatTimeRange(slot.startIso, slot.endIso)}
                  </span>
                  {active ? <Badge variant="brand">Selected</Badge> : null}
                </button>
              );
            })}
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-600">
            {confirmedId && selected ? (
              <span>
                Confirmed:{" "}
                <span className="font-medium text-slate-900">
                  {formatTimeRange(selected.startIso, selected.endIso)}
                </span>
              </span>
            ) : selected ? (
              <span>
                Selected:{" "}
                <span className="font-medium text-slate-900">
                  {formatTimeRange(selected.startIso, selected.endIso)}
                </span>
              </span>
            ) : (
              <span>Select a slot to book.</span>
            )}
          </div>
          <Button
            type="button"
            disabled={!selectedId}
            onClick={() => {
              if (!selectedId) return;
              setConfirmedId(selectedId);
              onBook?.(selectedId);
            }}
          >
            Book meeting
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

