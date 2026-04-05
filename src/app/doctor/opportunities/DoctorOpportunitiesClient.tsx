"use client";

import * as React from "react";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export type OpportunityManageRow = {
  id: string;
  doctor_id: string;
  title: string;
  description: string;
  is_active: boolean;
  created_at: string;
};

export function DoctorOpportunitiesClient({
  doctorId,
  initialRows,
  loadError
}: {
  doctorId: string;
  initialRows: OpportunityManageRow[];
  loadError: string | null;
}) {
  const [rows, setRows] = React.useState<OpportunityManageRow[]>(initialRows);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [formError, setFormError] = React.useState<string | null>(loadError);

  async function createListing(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!title.trim()) {
      setFormError("Add a title for your listing.");
      return;
    }
    setSaving(true);
    const { data, error: insErr } = await supabase
      .from("opportunities")
      .insert({
        doctor_id: doctorId,
        title: title.trim(),
        description: description.trim(),
        is_active: true
      })
      .select("id, doctor_id, title, description, is_active, created_at")
      .single();
    setSaving(false);
    if (insErr) {
      setFormError(insErr.message);
      return;
    }
    if (data) setRows((r) => [data as OpportunityManageRow, ...r]);
    setTitle("");
    setDescription("");
  }

  async function toggleActive(row: OpportunityManageRow) {
    setBusyId(row.id);
    setFormError(null);
    const next = !row.is_active;
    const { error: uErr } = await supabase
      .from("opportunities")
      .update({ is_active: next })
      .eq("id", row.id)
      .eq("doctor_id", doctorId);
    setBusyId(null);
    if (uErr) {
      setFormError(uErr.message);
      return;
    }
    setRows((prev) =>
      prev.map((r) => (r.id === row.id ? { ...r, is_active: next } : r))
    );
  }

  async function removeListing(id: string) {
    if (!window.confirm("Delete this listing? Students will no longer see it.")) return;
    setBusyId(id);
    setFormError(null);
    const { error: dErr } = await supabase
      .from("opportunities")
      .delete()
      .eq("id", id)
      .eq("doctor_id", doctorId);
    setBusyId(null);
    if (dErr) {
      setFormError(dErr.message);
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <div className="space-y-6">
      {formError ? (
        <div
          className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900"
          role="alert"
        >
          {formError}
        </div>
      ) : null}

      <Card className="shadow-card">
        <CardContent className="space-y-4">
          <div className="text-sm font-semibold text-slate-900">New listing</div>
          <p className="text-sm text-slate-600">
            Describe the shadowing experience, timing expectations, or how students should reach
            out. Students browse active listings on the network.
          </p>
          <form className="space-y-3" onSubmit={createListing}>
            <Input
              label="Title"
              placeholder="e.g. Outpatient cardiology — Spring quarter"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Textarea
              label="Description"
              placeholder="What should students know?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
            <Button type="submit" isLoading={saving} disabled={saving}>
              Publish listing
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <div className="text-sm font-semibold text-slate-900">Your listings</div>
        {rows.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
            You have not published any listings yet. Add one above to appear in student search.
          </div>
        ) : (
          <ul className="grid gap-3">
            {rows.map((row) => (
              <li key={row.id}>
                <Card className="shadow-soft">
                  <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-slate-900">
                          {row.title.trim() || "Untitled listing"}
                        </span>
                        {row.is_active ? (
                          <Badge variant="mint">Active</Badge>
                        ) : (
                          <Badge variant="slate">Hidden</Badge>
                        )}
                      </div>
                      {row.description.trim() ? (
                        <p className="text-sm text-slate-600 whitespace-pre-wrap">
                          {row.description}
                        </p>
                      ) : (
                        <p className="text-sm text-slate-400">No description</p>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={busyId === row.id}
                        onClick={() => toggleActive(row)}
                      >
                        {row.is_active ? "Hide" : "Activate"}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={busyId === row.id}
                        onClick={() => removeListing(row.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
