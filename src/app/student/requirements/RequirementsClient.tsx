"use client";

import * as React from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import {
  REQUIRED_STUDENT_DOCUMENTS,
  REQUIRED_DOCUMENT_KEYS
} from "@/lib/constants/requirements";
import { uploadStudentRequirementFile } from "@/lib/uploadStudentForm";
import { Card, CardContent } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";

export function RequirementsClient({ userId }: { userId: string }) {
  const [uploaded, setUploaded] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(true);
  const [busyKey, setBusyKey] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    const { data } = await supabase
      .from("student_documents")
      .select("requirement_key, file_url")
      .eq("student_id", userId);
    const map: Record<string, string> = {};
    for (const row of data ?? []) {
      map[row.requirement_key] = row.file_url;
    }
    setUploaded(map);
    setLoading(false);
  }, [userId]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const complete = REQUIRED_DOCUMENT_KEYS.every((k) => uploaded[k]);

  const onFile = async (key: string, file: File | null) => {
    if (!file) return;
    setBusyKey(key);
    setError(null);
    const up = await uploadStudentRequirementFile(supabase, userId, key, file);
    if ("error" in up) {
      setError(up.error);
      setBusyKey(null);
      return;
    }
    const { error: dErr } = await supabase.from("student_documents").upsert(
      {
        student_id: userId,
        requirement_key: key,
        file_url: up.publicUrl,
        file_name: file.name
      },
      { onConflict: "student_id,requirement_key" }
    );
    setBusyKey(null);
    if (dErr) {
      setError(dErr.message);
      return;
    }
    await load();
  };

  if (loading) {
    return <p className="text-sm text-slate-600">Loading requirements…</p>;
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-card">
        <CardContent className="space-y-3 pt-6">
          <SectionHeader
            title="Status"
            subtitle="You need each item below before you can request a physician match."
          />
          {complete ? (
            <div className="rounded-2xl border border-mint-200 bg-mint-50 px-4 py-3 text-sm font-medium text-mint-900">
              All required forms are on file. You can browse doctors and request connections.
            </div>
          ) : (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
              Complete every upload to unlock <strong>Request connection</strong> on doctor profiles.
            </div>
          )}
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {REQUIRED_STUDENT_DOCUMENTS.map((req) => {
          const has = Boolean(uploaded[req.key]);
          return (
            <Card key={req.key} className="shadow-soft">
              <CardContent className="space-y-3 pt-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{req.label}</div>
                    <p className="mt-1 text-sm text-slate-600">{req.description}</p>
                  </div>
                  {has ? (
                    <span className="rounded-full bg-mint-100 px-2.5 py-0.5 text-xs font-medium text-mint-800">
                      Uploaded
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                      Required
                    </span>
                  )}
                </div>
                {has ? (
                  <a
                    href={uploaded[req.key]}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium text-brand-700 hover:underline"
                  >
                    View uploaded file
                  </a>
                ) : null}
                <div>
                  <input
                    type="file"
                    className="text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-600 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white"
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                    disabled={busyKey !== null}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      void onFile(req.key, f ?? null);
                      e.target.value = "";
                    }}
                  />
                  {busyKey === req.key ? (
                    <span className="ml-2 text-xs text-slate-500">Uploading…</span>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/student">
          <Button variant="secondary">Back to dashboard</Button>
        </Link>
        <Link href="/opportunities">
          <Button variant="secondary">Browse opportunities</Button>
        </Link>
      </div>
    </div>
  );
}
