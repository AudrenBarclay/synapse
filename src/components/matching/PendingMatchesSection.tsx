"use client";

import * as React from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { ensureConversationForMatch } from "@/lib/matchConversation";

type Pending = {
  id: string;
  student_id: string;
  studentName: string;
};

export function PendingMatchesSection({ doctorId }: { doctorId: string }) {
  const [pending, setPending] = React.useState<Pending[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    const { data: rows } = await supabase
      .from("matches")
      .select("id, student_id")
      .eq("doctor_id", doctorId)
      .not("student_accepted_at", "is", null)
      .is("doctor_accepted_at", null);

    const list: Pending[] = [];
    for (const r of rows ?? []) {
      const { data: p } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", r.student_id)
        .single();
      list.push({
        id: r.id,
        student_id: r.student_id,
        studentName: p?.full_name?.trim() ?? ""
      });
    }
    setPending(list);
    setLoading(false);
  }, [doctorId]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const accept = async (matchId: string) => {
    setBusyId(matchId);
    setError(null);
    const now = new Date().toISOString();
    const { error: uErr } = await supabase
      .from("matches")
      .update({ doctor_accepted_at: now })
      .eq("id", matchId);
    if (uErr) {
      setError(uErr.message);
      setBusyId(null);
      return;
    }
    const conv = await ensureConversationForMatch(supabase, matchId);
    if ("error" in conv) {
      setError(conv.error);
    }
    setBusyId(null);
    await load();
  };

  const decline = async (matchId: string) => {
    setBusyId(matchId);
    setError(null);
    const { error: dErr } = await supabase.from("matches").delete().eq("id", matchId);
    if (dErr) setError(dErr.message);
    setBusyId(null);
    await load();
  };

  if (loading) {
    return null;
  }

  if (pending.length === 0) {
    return null;
  }

  return (
    <Card className="border-brand-200/60 bg-brand-50/30 shadow-card">
      <CardContent className="space-y-3 pt-6">
        <SectionHeader
          title="Pending connection requests"
          subtitle="Students who requested to match. Accept to open messaging."
        />
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        <ul className="space-y-3">
          {pending.map((p) => (
            <li
              key={p.id}
              className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  {p.studentName.trim() ? p.studentName : "Name not on profile"}
                </div>
                <Link href={`/students/${p.student_id}`} className="text-xs text-brand-700 hover:underline">
                  View profile
                </Link>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() => void accept(p.id)}
                  isLoading={busyId === p.id}
                  disabled={busyId !== null}
                >
                  Accept match
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => void decline(p.id)}
                  disabled={busyId !== null}
                >
                  Decline
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
