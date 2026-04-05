import * as React from "react";
import { cn } from "@/utils/cn";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, hint, error, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;

    return (
      <div className="space-y-1.5">
        {label ? (
          <label htmlFor={inputId} className="text-sm font-medium text-slate-800">
            {label}
          </label>
        ) : null}
        <textarea
          id={inputId}
          ref={ref}
          rows={4}
          className={cn(
            "w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm",
            "placeholder:text-slate-400",
            "focus:outline-none focus:ring-2 focus:ring-brand-600/30 focus:border-brand-600",
            error ? "border-rose-300 focus:ring-rose-500/20 focus:border-rose-600" : "border-slate-200",
            className
          )}
          {...props}
        />
        {error ? (
          <p className="text-sm text-rose-700">{error}</p>
        ) : hint ? (
          <p className="text-sm text-slate-500">{hint}</p>
        ) : null}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
