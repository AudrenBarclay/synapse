import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/utils/cn";

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "brand"
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: React.ReactNode;
  tone?: "brand" | "mint" | "slate";
}) {
  const toneClass =
    tone === "mint"
      ? "bg-mint-50 text-mint-700 border-mint-100"
      : tone === "slate"
        ? "bg-slate-50 text-slate-700 border-slate-200"
        : "bg-brand-50 text-brand-700 border-brand-100";

  return (
    <Card className="shadow-soft">
      <CardContent className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="text-sm font-medium text-slate-600">{label}</div>
          <div className="text-2xl font-semibold tracking-tight text-slate-900">
            {value}
          </div>
          {hint ? <div className="text-sm text-slate-500">{hint}</div> : null}
        </div>
        {icon ? (
          <div
            className={cn(
              "grid h-10 w-10 place-items-center rounded-2xl border",
              toneClass
            )}
          >
            {icon}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

