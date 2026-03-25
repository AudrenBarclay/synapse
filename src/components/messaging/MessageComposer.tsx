import * as React from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";

export function MessageComposer({
  placeholder = "Write a message…",
  onSend
}: {
  placeholder?: string;
  onSend: (body: string) => void;
}) {
  const [value, setValue] = React.useState("");

  function send() {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue("");
  }

  return (
    <div className="border-t border-slate-200/70 bg-white p-3">
      <div className="flex items-end gap-2">
        <textarea
          className={cn(
            "min-h-[44px] w-full resize-none rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm",
            "placeholder:text-slate-400",
            "focus:outline-none focus:ring-2 focus:ring-brand-600/30 focus:border-brand-600"
          )}
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
        />
        <Button onClick={send}>Send</Button>
      </div>
      <div className="mt-2 text-xs text-slate-500">
        Press Enter to send, Shift+Enter for a new line.
      </div>
    </div>
  );
}

