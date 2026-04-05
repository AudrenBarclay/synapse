import Link from "next/link";
import { cn } from "@/utils/cn";

export type SidebarItem = {
  label: string;
  href: string;
  badge?: string;
};

export function Sidebar({
  title,
  items,
  currentPath
}: {
  title: string;
  items: SidebarItem[];
  currentPath: string;
}) {
  return (
    <aside className="hidden w-64 shrink-0 md:block">
      <div className="sticky top-20 space-y-4">
        <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-soft">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {title}
          </div>
          <div className="mt-3 grid gap-1">
            {items.map((item) => {
              const active = currentPath === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition",
                    active
                      ? "bg-brand-50 text-brand-800 ring-1 ring-brand-100"
                      : "text-slate-700 hover:bg-slate-100"
                  )}
                >
                  <span>{item.label}</span>
                  {item.badge ? (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-soft">
          <div className="text-sm font-semibold text-slate-900">Tips</div>
          <p className="mt-1 text-sm text-slate-600">
            Navigation only—your dashboards load live data from Supabase
            their profiles. Keep messages concise; include learning goals and availability.
          </p>
        </div>
      </div>
    </aside>
  );
}

