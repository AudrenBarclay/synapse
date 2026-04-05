"use client";

import * as React from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { ensureConversationForMatch } from "@/lib/matchConversation";

export function StudentProfileDoctorPanel({
  doctorId,
  studentId
}: {
  doctorId: string;
  studentId: string;
}) {
  const [matchId, setMatchId] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);
  const [active, setActive] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data } = await supabase
        .from("matches")
        .select("id, student_accepted_at, doctor_accepted_at")
        .eq("student_id", studentId)
        .eq("doctor_id", doctorId)
        .maybeSingle();
      if (cancelled) return;
      if (!data) {
        setMatchId(null);
        setPending(false);
        setActive(false);
      } else {
        setMatchId(data.id);
        setPending(Boolean(data.student_accepted_at && !data.doctor_accepted_at));
        setActive(Boolean(data.student_accepted_at && data.doctor_accepted_at));
      }
      setLoading(false);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [doctorId, studentId]);

  const accept = async () => {
    if (!matchId) return;
    setBusy(true);
    setError(null);
    await supabase.from("matches").update({ doctor_accepted_at: new Date().toISOString() }).eq("id", matchId);
    const r = await ensureConversationForMatch(supabase, matchId);
    if ("error" in r) setError(r.error);
    setPending(false);
    setActive(true);
    setBusy(false);
  };

  const decline = async () => {
    if (!matchId) return;
    setBusy(true);
    await supabase.from("matches").delete().eq("id", matchId);
    setMatchId(null);
    setPending(false);
    setActive(false);
    setBusy(false);
  };

  if (loading || !matchId) {
    return null;
  }

  if (active) {
    return (
      <div className="rounded-2xl border border-mint-200 bg-mint-50/80 p-4">
        <div className="text-sm font-medium text-mint-900">Matched student</div>
        <p className="mt-1 text-sm text-mint-800/90">
          You can message them about shadowing goals and logistics.
        </p>
        <Link href="/messages" className="mt-3 inline-block">
          <Button size="sm">Open messages</Button>
        </Link>
      </div>
    );
  }

  if (!pending) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-brand-200 bg-brand-50/60 p-4 space-y-3">
      <div className="text-sm font-semibold text-slate-900">Connection request</div>
      <p className="text-sm text-slate-700">
        This student requested to connect. Accept to unlock messaging and coordinate shadowing.
      </p>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => void accept()} isLoading={busy} disabled={busy}>
          Accept match
        </Button>
        <Button size="sm" variant="secondary" onClick={() => void decline()} disabled={busy}>
          Decline
        </Button>
      </div>
    </div>
  );
}
