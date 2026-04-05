"use client";

import * as React from "react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Card, CardContent } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const HALVES = [
  { key: "am" as const, label: "AM" },
  { key: "pm" as const, label: "PM" }
];

type HalfSlot = {
  doctor_id: string;
  day_of_week: number;
  half_day: "am" | "pm";
  is_available: boolean;
};

type ScheduleItem = {
  id: string;
  doctor_id: string;
  day_of_week: number;
  half_day: "am" | "pm";
  title: string;
  details: string;
};

export function DoctorWeekScheduleSection({ doctorId }: { doctorId: string }) {
  const [slots, setSlots] = React.useState<HalfSlot[]>([]);
  const [items, setItems] = React.useState<ScheduleItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [addFor, setAddFor] = React.useState<{ d: number; h: "am" | "pm" } | null>(null);
  const [newTitle, setNewTitle] = React.useState("");
  const [newDetails, setNewDetails] = React.useState("");
  const [savingItem, setSavingItem] = React.useState(false);

  const load = React.useCallback(async () => {
    const [{ data: s }, { data: i }] = await Promise.all([
      supabase.from("doctor_week_half_slots").select("*").eq("doctor_id", doctorId),
      supabase
        .from("doctor_schedule_items")
        .select("*")
        .eq("doctor_id", doctorId)
        .order("sort_order", { ascending: true })
    ]);
    setSlots((s as HalfSlot[]) ?? []);
    setItems((i as ScheduleItem[]) ?? []);
    setLoading(false);
  }, [doctorId]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const isOpen = (d: number, h: "am" | "pm") => {
    const row = slots.find((x) => x.day_of_week === d && x.half_day === h);
    return row?.is_available ?? false;
  };

  const toggle = async (d: number, h: "am" | "pm") => {
    const next = !isOpen(d, h);
    const { error } = await supabase.from("doctor_week_half_slots").upsert(
      {
        doctor_id: doctorId,
        day_of_week: d,
        half_day: h,
        is_available: next
      },
      { onConflict: "doctor_id,day_of_week,half_day" }
    );
    if (!error) {
      setSlots((prev) => {
        const rest = prev.filter((x) => !(x.day_of_week === d && x.half_day === h));
        return [...rest, { doctor_id: doctorId, day_of_week: d, half_day: h, is_available: next }];
      });
    }
  };

  const cellItems = (d: number, h: "am" | "pm") =>
    items.filter((x) => x.day_of_week === d && x.half_day === h);

  const addItem = async () => {
    if (!addFor || !newTitle.trim()) return;
    setSavingItem(true);
    const { data, error } = await supabase
      .from("doctor_schedule_items")
      .insert({
        doctor_id: doctorId,
        day_of_week: addFor.d,
        half_day: addFor.h,
        title: newTitle.trim(),
        details: newDetails.trim()
      })
      .select("*")
      .single();
    setSavingItem(false);
    if (!error && data) {
      setItems((prev) => [...prev, data as ScheduleItem]);
      setNewTitle("");
      setNewDetails("");
      setAddFor(null);
    }
  };

  const removeItem = async (id: string) => {
    const { error } = await supabase.from("doctor_schedule_items").delete().eq("id", id);
    if (!error) setItems((prev) => prev.filter((x) => x.id !== id));
  };

  if (loading) {
    return <div className="text-sm text-slate-500">Loading week layout…</div>;
  }

  return (
    <Card className="shadow-card">
      <CardContent className="space-y-4 pt-6">
        <SectionHeader
          title="Week availability (AM / PM)"
          subtitle="Toggle halves you are generally open, then add procedures or notes with +."
        />

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="border border-slate-200 bg-slate-50 p-2 text-left font-medium text-slate-700" />
                {DAYS.map((d, i) => (
                  <th
                    key={d}
                    className="border border-slate-200 bg-slate-50 p-2 text-center font-medium text-slate-800"
                  >
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HALVES.map(({ key: half, label }) => (
                <tr key={half}>
                  <td className="border border-slate-200 bg-slate-50/80 px-2 py-2 font-medium text-slate-700">
                    {label}
                  </td>
                  {DAYS.map((_, dayIndex) => (
                    <td
                      key={`${half}-${dayIndex}`}
                      className="align-top border border-slate-200 p-1.5"
                    >
                      <button
                        type="button"
                        onClick={() => void toggle(dayIndex, half)}
                        className={[
                          "mb-1 w-full rounded-lg px-2 py-1.5 text-xs font-medium transition",
                          isOpen(dayIndex, half)
                            ? "bg-mint-100 text-mint-900 ring-1 ring-mint-200"
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        ].join(" ")}
                      >
                        {isOpen(dayIndex, half) ? "Open" : "Off"}
                      </button>
                      <ul className="space-y-1">
                        {cellItems(dayIndex, half).map((it) => (
                          <li
                            key={it.id}
                            className="rounded-md bg-white px-1.5 py-1 text-xs text-slate-800 shadow-sm ring-1 ring-slate-100"
                          >
                            <div className="flex items-start justify-between gap-1">
                              <span className="font-medium leading-tight">{it.title}</span>
                              <button
                                type="button"
                                className="shrink-0 text-rose-600 hover:underline"
                                onClick={() => void removeItem(it.id)}
                              >
                                ×
                              </button>
                            </div>
                            {it.details ? (
                              <div className="mt-0.5 text-[11px] text-slate-500">{it.details}</div>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="mt-1 h-7 w-full text-xs"
                        onClick={() => setAddFor({ d: dayIndex, h: half })}
                      >
                        + Add
                      </Button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {addFor ? (
          <div className="rounded-2xl border border-brand-200 bg-brand-50/50 p-4 space-y-3">
            <div className="text-sm font-medium text-slate-900">
              New item — {DAYS[addFor.d]} {addFor.h.toUpperCase()}
            </div>
            <Input
              label="Title"
              placeholder="e.g. Clinic procedures, Rounds, OR observation"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <Textarea
              label="Details (optional)"
              rows={2}
              value={newDetails}
              onChange={(e) => setNewDetails(e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              <Button type="button" size="sm" onClick={() => void addItem()} isLoading={savingItem}>
                Save item
              </Button>
              <Button type="button" variant="secondary" size="sm" onClick={() => setAddFor(null)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
