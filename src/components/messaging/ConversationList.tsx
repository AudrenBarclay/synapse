import { cn } from "@/utils/cn";
import type { Conversation, UserRole } from "@/types";
import { Avatar } from "@/components/ui/Avatar";

function getOther(convo: Conversation, meRole: UserRole) {
  return convo.participants.find((p) => p.role !== meRole) ?? convo.participants[0];
}

export function ConversationList({
  meRole,
  items,
  selectedId,
  onSelect
}: {
  meRole: UserRole;
  items: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="h-full overflow-auto border-r border-slate-200/70 bg-white">
      <div className="px-4 py-3">
        <div className="text-sm font-semibold text-slate-900">Conversations</div>
        <div className="text-sm text-slate-600">Your recent messages</div>
      </div>
      <div className="px-2 pb-3">
        {items.map((c) => {
          const other = getOther(c, meRole);
          const active = c.id === selectedId;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect(c.id)}
              className={cn(
                "w-full rounded-2xl px-3 py-3 text-left transition",
                active ? "bg-brand-50 ring-1 ring-brand-100" : "hover:bg-slate-50"
              )}
            >
              <div className="flex items-start gap-3">
                <Avatar name={other.name} src={other.avatar} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="truncate text-sm font-semibold text-slate-900">
                      {other.name.trim() ? (
                        other.name
                      ) : (
                        <span className="text-slate-400">Name not set</span>
                      )}
                    </div>
                    {c.unreadCount > 0 ? (
                      <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand-600 px-1 text-xs font-semibold text-white">
                        {c.unreadCount}
                      </span>
                    ) : null}
                  </div>
                  <div className="truncate text-xs text-slate-500">{other.subtitle}</div>
                  <div className="mt-1 truncate text-sm text-slate-600">
                    {c.lastMessagePreview}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

