"use client";

import * as React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { ConversationList } from "@/components/messaging/ConversationList";
import { MessageThread } from "@/components/messaging/MessageThread";
import { MessageComposer } from "@/components/messaging/MessageComposer";
import { supabase } from "@/lib/supabase/client";
import type { Conversation, ConversationParticipant, Message, UserRole } from "@/types";
import { Button } from "@/components/ui/Button";

type ProfileMini = {
  id: string;
  full_name: string | null;
  role: UserRole;
  avatar_url: string | null;
  headline: string | null;
  specialty: string | null;
  organization: string | null;
};

function subtitleFor(p: ProfileMini): string {
  if (p.role === "doctor") {
    return [p.specialty, p.organization].filter(Boolean).join(" · ") || "";
  }
  return p.headline?.trim() || "";
}

function toParticipant(p: ProfileMini): ConversationParticipant {
  return {
    id: p.id,
    role: p.role,
    name: p.full_name?.trim() ?? "",
    avatar: p.avatar_url,
    subtitle: subtitleFor(p)
  };
}

export function MessagesClient() {
  const [meId, setMeId] = React.useState<string | null>(null);
  const [meRole, setMeRole] = React.useState<UserRole>("student");
  const [meName, setMeName] = React.useState("You");
  const [convos, setConvos] = React.useState<Conversation[]>([]);
  const [msgs, setMsgs] = React.useState<Message[]>([]);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setLoadError(null);
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) {
        setMeId(null);
        setLoading(false);
        return;
      }

      const { data: prof, error: pErr } = await supabase
        .from("profiles")
        .select("id, role, full_name")
        .eq("id", user.id)
        .single();

      if (pErr || !prof) {
        if (!cancelled) {
          setLoadError(pErr?.message ?? "Profile not found.");
          setLoading(false);
        }
        return;
      }

      const myRole = prof.role as UserRole;
      if (!cancelled) {
        setMeId(prof.id);
        setMeRole(myRole);
        setMeName(prof.full_name?.trim() || "You");
      }

      const { data: parts, error: cErr } = await supabase
        .from("conversation_participants")
        .select("conversation_id, unread_count")
        .eq("profile_id", prof.id);

      if (cErr) {
        if (!cancelled) {
          setLoadError(cErr.message);
          setLoading(false);
        }
        return;
      }

      const ids = parts?.map((p) => p.conversation_id) ?? [];
      if (ids.length === 0) {
        if (!cancelled) {
          setConvos([]);
          setMsgs([]);
          setSelectedId(null);
          setLoading(false);
        }
        return;
      }

      const { data: convoRows, error: convoErr } = await supabase
        .from("conversations")
        .select("id, last_message_preview, last_message_at, match_id")
        .in("id", ids)
        .not("match_id", "is", null);

      if (convoErr || !convoRows) {
        if (!cancelled) {
          setLoadError(convoErr?.message ?? "Could not load conversations.");
          setLoading(false);
        }
        return;
      }

      const { data: selfFull } = await supabase
        .from("profiles")
        .select("id, full_name, role, avatar_url, headline, specialty, organization")
        .eq("id", prof.id)
        .single();

      const selfMini = selfFull as ProfileMini | null;
      if (!selfMini) {
        if (!cancelled) setLoading(false);
        return;
      }

      const selfPart = toParticipant(selfMini);

      const built: Conversation[] = [];
      for (const c of convoRows) {
        const { data: cps } = await supabase
          .from("conversation_participants")
          .select("profile_id")
          .eq("conversation_id", c.id);

        const pids = cps?.map((x) => x.profile_id) ?? [];
        const otherId = pids.find((id) => id !== prof.id);
        if (!otherId) continue;

        const { data: otherFull } = await supabase
          .from("profiles")
          .select("id, full_name, role, avatar_url, headline, specialty, organization")
          .eq("id", otherId)
          .single();

        const o = otherFull as ProfileMini | null;
        if (!o) continue;

        const otherPart = toParticipant(o);
        const unread =
          parts?.find((p) => p.conversation_id === c.id)?.unread_count ?? 0;

        built.push({
          id: c.id,
          participants: [selfPart, otherPart],
          lastMessagePreview: c.last_message_preview ?? "",
          lastMessageAtIso: c.last_message_at ?? new Date().toISOString(),
          unreadCount: unread
        });
      }

      const { data: allMsgs, error: mErr } = await supabase
        .from("messages")
        .select("id, conversation_id, sender_id, body, created_at, read_at")
        .in("conversation_id", ids)
        .order("created_at", { ascending: true });

      if (mErr) {
        if (!cancelled) {
          setLoadError(mErr.message);
          setLoading(false);
        }
        return;
      }

      const mapped: Message[] = (allMsgs ?? []).map((m) => {
        const senderRole: UserRole =
          m.sender_id === prof.id
            ? myRole
            : myRole === "student"
              ? "doctor"
              : "student";
        return {
          id: m.id,
          conversationId: m.conversation_id,
          senderId: m.sender_id,
          senderRole,
          body: m.body,
          sentAtIso: m.created_at,
          status: m.read_at ? "read" : "delivered"
        };
      });

      if (!cancelled) {
        setConvos(built);
        setMsgs(mapped);
        setSelectedId(built[0]?.id ?? null);
        setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const selected = convos.find((c) => c.id === selectedId) ?? null;
  const thread = selected ? msgs.filter((m) => m.conversationId === selected.id) : [];

  const other = selected
    ? selected.participants.find((p) => p.role !== meRole) ?? selected.participants[0]
    : null;

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="text-sm text-slate-600">Loading messages…</div>
      </main>
    );
  }

  if (!meId) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <div className="text-lg font-semibold text-slate-900">Sign in to message</div>
          <p className="mt-2 text-sm text-slate-600">
            Log in with your student or doctor account to view conversations.
          </p>
          <Link href="/auth" className="mt-4 inline-block">
            <Button>Go to sign in</Button>
          </Link>
        </div>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          {loadError} — ensure the Supabase schema for messaging is applied (
          <code className="rounded bg-white px-1">supabase/schema.sql</code>).
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-lg font-semibold text-slate-900">Messaging</div>
          <div className="text-sm text-slate-600">
            Signed in as {meName} ({meRole}). Only mutual matches appear here.
          </div>
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
                  meName={meName}
                  otherName={other.name}
                  otherAvatar={other.avatar}
                  messages={thread}
                />
                <MessageComposer
                  onSend={async (body) => {
                    if (!selected || !meId) return;
                    const { data, error } = await supabase
                      .from("messages")
                      .insert({
                        conversation_id: selected.id,
                        sender_id: meId,
                        body
                      })
                      .select("id, created_at")
                      .single();

                    if (error) {
                      setLoadError(error.message);
                      return;
                    }

                    const next: Message = {
                      id: data.id,
                      conversationId: selected.id,
                      senderId: meId,
                      senderRole: meRole,
                      body,
                      sentAtIso: data.created_at,
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

                    await supabase
                      .from("conversations")
                      .update({
                        last_message_preview: body,
                        last_message_at: next.sentAtIso
                      })
                      .eq("id", selected.id);
                  }}
                />
              </>
            ) : (
              <div className="grid h-full place-items-center p-6">
                <div className="max-w-sm rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-soft">
                  <div className="text-sm font-semibold text-slate-900">
                    {convos.length === 0 ? "No conversations yet" : "Select a conversation"}
                  </div>
                  <div className="mt-1 text-sm text-slate-600">
                    {convos.length === 0
                      ? "Messaging opens after you and the other person both accept a connection. Request a match on a doctor profile, or accept requests on your dashboard."
                      : "Choose a thread on the left."}
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
