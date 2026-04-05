"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Card, CardContent } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { WeekHalfSlotDraft, WeekScheduleItemDraft } from "@/lib/doctorWeekSchedule";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const HALVES = [
  { key: "am" as const, label: "AM" },
  { key: "pm" as const, label: "PM" }
];

export type DoctorWeekScheduleSectionProps = {
  slots: WeekHalfSlotDraft[];
  items: WeekScheduleItemDraft[];
  onSlotsChange: (next: WeekHalfSlotDraft[]) => void;
  onItemsChange: (next: WeekScheduleItemDraft[]) => void;
};

export function DoctorWeekScheduleSection({
  slots,
  items,
  onSlotsChange,
  onItemsChange
}: DoctorWeekScheduleSectionProps) {
  const [addFor, setAddFor] = React.useState<{ d: number; h: "am" | "pm" } | null>(null);
  const [newTitle, setNewTitle] = React.useState("");
  const [newDetails, setNewDetails] = React.useState("");
  const [itemEditorError, setItemEditorError] = React.useState<string | null>(null);

  const isOpen = (d: number, h: "am" | "pm") => {
    const row = slots.find((x) => x.day_of_week === d && x.half_day === h);
    return row?.is_available ?? false;
  };

  const toggle = (d: number, h: "am" | "pm") => {
    const next = !isOpen(d, h);
    const rest = slots.filter((x) => !(x.day_of_week === d && x.half_day === h));
    onSlotsChange([...rest, { day_of_week: d, half_day: h, is_available: next }]);
  };

  const cellItems = (d: number, h: "am" | "pm") =>
    items.filter((x) => x.day_of_week === d && x.half_day === h);

  const saveNewItem = () => {
    if (!addFor) return;
    const title = newTitle.trim();
    if (!title) {
      setItemEditorError("Add a title before saving this item.");
      return;
    }
    setItemEditorError(null);
    const next: WeekScheduleItemDraft = {
      id: crypto.randomUUID(),
      day_of_week: addFor.d,
      half_day: addFor.h,
      title,
      details: newDetails.trim()
    };
    onItemsChange([...items, next]);
    setNewTitle("");
    setNewDetails("");
    setAddFor(null);
  };

  const removeItem = (id: string) => {
    onItemsChange(items.filter((x) => x.id !== id));
  };

  const openAddFor = (d: number, h: "am" | "pm") => {
    setItemEditorError(null);
    setNewTitle("");
    setNewDetails("");
    setAddFor({ d, h });
  };

  const cancelAdd = () => {
    setAddFor(null);
    setItemEditorError(null);
    setNewTitle("");
    setNewDetails("");
  };

  return (
    <Card className="shadow-card">
      <CardContent className="space-y-4 pt-6">
        <SectionHeader
          title="Week availability (AM / PM)"
          subtitle="Toggle open halves and add notes per block. Click Save profile below to store your schedule."
        />

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="border border-slate-200 bg-slate-50 p-2 text-left font-medium text-slate-700" />
                {DAYS.map((d) => (
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
                        onClick={() => toggle(dayIndex, half)}
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
                                onClick={() => removeItem(it.id)}
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
                        onClick={() => openAddFor(dayIndex, half)}
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
          <div className="space-y-3 rounded-2xl border border-brand-200 bg-brand-50/50 p-4">
            <div className="text-sm font-medium text-slate-900">
              New item — {DAYS[addFor.d]} {addFor.h.toUpperCase()}
            </div>
            <Input
              label="Title"
              placeholder="e.g. Clinic procedures, Rounds, OR observation"
              value={newTitle}
              onChange={(e) => {
                setNewTitle(e.target.value);
                if (itemEditorError) setItemEditorError(null);
              }}
            />
            <Textarea
              label="Details (optional)"
              rows={2}
              value={newDetails}
              onChange={(e) => setNewDetails(e.target.value)}
            />
            {itemEditorError ? (
              <p className="text-sm text-rose-600" role="alert">
                {itemEditorError}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <Button type="button" size="sm" onClick={saveNewItem}>
                Save item
              </Button>
              <Button type="button" variant="secondary" size="sm" onClick={cancelAdd}>
                Cancel
              </Button>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
