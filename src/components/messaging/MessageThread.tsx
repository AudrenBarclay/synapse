import * as React from "react";
import { cn } from "@/utils/cn";
import type { Message, UserRole } from "@/types";
import { Avatar } from "@/components/ui/Avatar";

export function MessageThread({
  meRole,
  meName,
  otherName,
  otherAvatar,
  messages
}: {
  meRole: UserRole;
  meName: string;
  otherName: string;
  otherAvatar: string | null;
  messages: Message[];
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200/70 bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar name={otherName} src={otherAvatar} />
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-slate-900">
              {otherName}
            </div>
            <div className="text-xs text-slate-500">
              Keep messages professional and concise.
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-3">
          {messages.map((m) => {
            const isMe = m.senderRole === meRole;
            return (
              <div
                key={m.id}
                className={cn("flex", isMe ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-soft",
                    isMe
                      ? "bg-brand-600 text-white"
                      : "bg-white text-slate-900 border border-slate-200/70"
                  )}
                >
                  <div className={cn("text-xs", isMe ? "text-white/80" : "text-slate-500")}>
                    {isMe ? meName : otherName} ·{" "}
                    {new Date(m.sentAtIso).toLocaleTimeString(undefined, {
                      hour: "numeric",
                      minute: "2-digit"
                    })}
                  </div>
                  <div className="mt-1 whitespace-pre-wrap">{m.body}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

