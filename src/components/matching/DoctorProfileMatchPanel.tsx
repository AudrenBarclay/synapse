"use client";

import * as React from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { REQUIRED_DOCUMENT_KEYS } from "@/lib/constants/requirements";

type MatchRow = {
  id: string;
  student_accepted_at: string | null;
  doctor_accepted_at: string | null;
};

export function DoctorProfileMatchPanel({
  doctorId,
  viewerUserId,
  viewerRole
}: {
  doctorId: string;
  viewerUserId: string | null;
  viewerRole: "student" | "doctor" | null;
}) {
  const [match, setMatch] = React.useState<MatchRow | null>(null);
  const [prereqOk, setPrereqOk] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const isStudent = viewerRole === "student" && Boolean(viewerUserId);
  const isOwnDoctor = viewerUserId === doctorId && viewerRole === "doctor";

  React.useEffect(() => {
    if (!viewerUserId || !isStudent) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      const { data: docs } = await supabase
        .from("student_documents")
        .select("requirement_key")
        .eq("student_id", viewerUserId);

      const keys = new Set(docs?.map((d) => d.requirement_key) ?? []);
      if (!cancelled) {
        setPrereqOk(REQUIRED_DOCUMENT_KEYS.every((k) => keys.has(k)));
      }

      const { data: m } = await supabase
        .from("matches")
        .select("id, student_accepted_at, doctor_accepted_at")
        .eq("student_id", viewerUserId)
        .eq("doctor_id", doctorId)
        .maybeSingle();

      if (!cancelled) {
        setMatch(m ?? null);
        setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [viewerUserId, doctorId, isStudent]);

  const requestMatch = async () => {
    if (!viewerUserId || !prereqOk) return;
    setBusy(true);
    setError(null);
    const { error: e } = await supabase.from("matches").insert({
      student_id: viewerUserId,
      doctor_id: doctorId,
      student_accepted_at: new Date().toISOString()
    });
    setBusy(false);
    if (e) {
      if (e.code === "23505") {
        setError("You already have a request or match with this physician.");
      } else {
        setError(e.message);
      }
      return;
    }
    const { data: row } = await supabase
      .from("matches")
      .select("id, student_accepted_at, doctor_accepted_at")
      .eq("student_id", viewerUserId)
      .eq("doctor_id", doctorId)
      .single();
    if (row) setMatch(row);
  };

  const isActive =
    match?.student_accepted_at &&
    match?.doctor_accepted_at &&
    match.id;

  if (isOwnDoctor || !viewerUserId) {
    return null;
  }

  if (!isStudent) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        Sign in as a student to request a mentoring connection. Messaging opens only after both you
        and the physician accept.
      </div>
    );
  }

  if (loading) {
    return <div className="text-sm text-slate-500">Checking connection status…</div>;
  }

  if (!prereqOk) {
    return (
      <div className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
        <div className="text-sm font-medium text-amber-950">Complete prerequisites first</div>
        <p className="text-sm text-amber-900/90">
          Upload the required forms so physicians know you are cleared to shadow. Then you can
          request a match.
        </p>
        <Link href="/student/requirements">
          <Button className="w-full sm:w-auto">Go to forms &amp; uploads</Button>
        </Link>
      </div>
    );
  }

  if (isActive && match?.id) {
    return (
      <div className="space-y-3">
        <div className="text-sm font-medium text-mint-800">You are connected</div>
        <p className="text-sm text-slate-600">
          You can message this physician now that you have both accepted the match.
        </p>
        <Link href="/messages">
          <Button className="w-full">Open messages</Button>
        </Link>
      </div>
    );
  }

  if (match?.student_accepted_at && !match?.doctor_accepted_at) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
        <span className="font-medium text-slate-900">Request sent.</span> When this physician
        accepts, messaging will unlock. You will see the thread under Messages.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      <p className="text-sm text-slate-600">
        Request a connection first. After the physician accepts, you can open Messages to chat.
      </p>
      <Button className="w-full" onClick={() => void requestMatch()} isLoading={busy} disabled={busy}>
        Request connection
      </Button>
    </div>
  );
}
