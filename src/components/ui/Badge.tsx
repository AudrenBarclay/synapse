import * as React from "react";
import { cn } from "@/utils/cn";

type Variant = "default" | "brand" | "mint" | "slate";

const variants: Record<Variant, string> = {
  default: "bg-slate-100 text-slate-700",
  brand: "bg-brand-50 text-brand-700 border border-brand-100",
  mint: "bg-mint-50 text-mint-700 border border-mint-100",
  slate: "bg-white text-slate-700 border border-slate-200"
};

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

