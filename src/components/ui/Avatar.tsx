import { cn } from "@/utils/cn";

export function Avatar({
  name,
  src,
  size = "md",
  className
}: {
  name: string;
  src?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const sizeClass =
    size === "sm"
      ? "h-8 w-8 text-xs"
      : size === "lg"
        ? "h-12 w-12 text-sm"
        : size === "xl"
          ? "h-16 w-16 text-base"
          : "h-10 w-10 text-sm";

  const trimmed = name.trim();
  const initials = trimmed
    ? trimmed
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join("")
    : "";

  const label = trimmed || "Profile";

  return (
    <div
      className={cn(
        "grid shrink-0 place-items-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 text-slate-700",
        sizeClass,
        className
      )}
      aria-label={label}
      title={label}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={label} className="h-full w-full object-cover" />
      ) : (
        <span className="font-semibold">{initials || "—"}</span>
      )}
    </div>
  );
}

