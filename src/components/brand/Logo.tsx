import * as React from "react";
import { cn } from "@/utils/cn";

export function Logo({
  className,
  withWordmark = true
}: {
  className?: string;
  withWordmark?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white shadow-sm">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M12 2c3.4 0 6.2 2.7 6.2 6 0 2.1-1.1 4-2.9 5.1-.6.4-1.2 1.2-1.4 2l-.2 1.1h-3.4l-.2-1.1c-.2-.8-.8-1.6-1.4-2C6.9 12 5.8 10.1 5.8 8c0-3.3 2.8-6 6.2-6Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M9.3 21.5h5.4"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M12 7v4"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M10 9h4"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </div>
      {withWordmark ? (
        <div className="leading-tight">
          <div className="text-sm font-semibold text-slate-900">Synapse</div>
          <div className="text-xs text-slate-500">Shadowing Network</div>
        </div>
      ) : null}
    </div>
  );
}

