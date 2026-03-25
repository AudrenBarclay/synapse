import { cn } from "@/utils/cn";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-slate-100",
        "shadow-[inset_0_0_0_1px_rgba(15,23,42,0.04)]",
        className
      )}
    />
  );
}

