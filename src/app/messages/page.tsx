"use client";

import * as React from "react";
import { Card } from "@/components/ui/Card";
import { ConversationList } from "@/components/messaging/ConversationList";
import { MessageThread } from "@/components/messaging/MessageThread";
import { MessageComposer } from "@/components/messaging/MessageComposer";
import { conversations as seedConversations, messages as seedMessages, students, doctors } from "@/data";
import type { Message, UserRole } from "@/types";
import { Button } from "@/components/ui/Button";

export default function MessagesPage() {
  const [meRole, setMeRole] = React.useState<UserRole>("student");
  const me = meRole === "student" ? students[0] : doctors[0];

  const [convos, setConvos] = React.useState(seedConversations);
  const [msgs, setMsgs] = React.useState<Message[]>(seedMessages);
  const [selectedId, setSelectedId] = React.useState<string | null>(convos[0]?.id ?? null);

  const selected = convos.find((c) => c.id === selectedId) ?? null;
  const thread = selected ? msgs.filter((m) => m.conversationId === selected.id) : [];

  const other = selected
    ? selected.participants.find((p) => p.role !== meRole) ?? selected.participants[0]
    : null;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-lg font-semibold text-slate-900">Messaging</div>
          <div className="text-sm text-slate-600">
            A polished chat UI for students and doctors (mock data).
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={meRole === "student" ? "primary" : "secondary"}
            onClick={() => setMeRole("student")}
          >
            View as Student
          </Button>
          <Button
            variant={meRole === "doctor" ? "primary" : "secondary"}
            onClick={() => setMeRole("doctor")}
          >
            View as Doctor
          </Button>
        </div>
      </div>

      <Card className="h-[70vh] overflow-hidden shadow-card">
        <div className="grid h-full grid-cols-1 md:grid-cols-[320px_1fr]">
          <ConversationList
            meRole={meRole}
            items={convos}
            selectedId={selectedId}
            onSelect={(id) => {
              setSelectedId(id);
              setConvos((prev) =>
                prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
              );
            }}
          />

          <div className="flex h-full flex-col bg-slate-50">
            {selected && other ? (
              <>
                <MessageThread
                  meRole={meRole}
                  meName={me.name}
                  otherName={other.name}
                  otherAvatar={other.avatar}
                  messages={thread}
                />
                <MessageComposer
                  onSend={(body) => {
                    const next: Message = {
                      id: `m-${Math.random().toString(16).slice(2)}`,
                      conversationId: selected.id,
                      senderId: me.id,
                      senderRole: meRole,
                      body,
                      sentAtIso: new Date().toISOString(),
                      status: "sent"
                    };
                    setMsgs((prev) => [...prev, next]);
                    setConvos((prev) =>
                      prev.map((c) =>
                        c.id === selected.id
                          ? {
                              ...c,
                              lastMessagePreview: body,
                              lastMessageAtIso: next.sentAtIso
                            }
                          : c
                      )
                    );
                  }}
                />
              </>
            ) : (
              <div className="grid h-full place-items-center p-6">
                <div className="max-w-sm rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-soft">
                  <div className="text-sm font-semibold text-slate-900">
                    Select a conversation
                  </div>
                  <div className="mt-1 text-sm text-slate-600">
                    Choose a thread on the left to start messaging.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </main>
  );
}

