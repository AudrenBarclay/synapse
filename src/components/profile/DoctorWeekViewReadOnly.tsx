import { Card, CardContent } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export type WeekHalfSlotRow = {
  day_of_week: number;
  half_day: "am" | "pm";
  is_available: boolean;
};

export type ScheduleItemRow = {
  id: string;
  day_of_week: number;
  half_day: "am" | "pm";
  title: string;
  details: string;
};

export function DoctorWeekViewReadOnly({
  slots,
  items
}: {
  slots: WeekHalfSlotRow[];
  items: ScheduleItemRow[];
}) {
  const isOpen = (d: number, h: "am" | "pm") => {
    const row = slots.find((x) => x.day_of_week === d && x.half_day === h);
    return row?.is_available ?? false;
  };

  const cellItems = (d: number, h: "am" | "pm") =>
    items.filter((x) => x.day_of_week === d && x.half_day === h);

  const hasAny = slots.some((s) => s.is_available) || items.length > 0;

  if (!hasAny) {
    return (
      <Card className="shadow-soft">
        <CardContent className="py-6">
          <SectionHeader title="Weekly schedule" subtitle="This physician has not published AM/PM blocks yet." />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-soft">
      <CardContent className="space-y-4 pt-6">
        <SectionHeader
          title="Weekly schedule"
          subtitle="Half-day blocks (AM / PM). Items may note procedures or focus areas."
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="border border-slate-200 bg-slate-50 p-2 text-left text-slate-600" />
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
              {(["am", "pm"] as const).map((half) => (
                <tr key={half}>
                  <td className="border border-slate-200 bg-slate-50/80 px-2 py-2 font-medium text-slate-700">
                    {half.toUpperCase()}
                  </td>
                  {DAYS.map((_, dayIndex) => (
                    <td
                      key={`${half}-${dayIndex}`}
                      className="align-top border border-slate-200 p-2"
                    >
                      <div
                        className={[
                          "mb-2 inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                          isOpen(dayIndex, half)
                            ? "bg-mint-100 text-mint-900"
                            : "bg-slate-100 text-slate-500"
                        ].join(" ")}
                      >
                        {isOpen(dayIndex, half) ? "Available" : "Not set"}
                      </div>
                      <ul className="space-y-1.5">
                        {cellItems(dayIndex, half).map((it) => (
                          <li
                            key={it.id}
                            className="rounded-lg border border-slate-100 bg-white px-2 py-1.5 text-xs text-slate-800 shadow-sm"
                          >
                            <div className="font-medium">{it.title}</div>
                            {it.details ? (
                              <div className="mt-0.5 text-slate-500">{it.details}</div>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
