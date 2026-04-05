"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProfilePictureUpload } from "@/components/profile/ProfilePictureUpload";

type RoleChoice = "student" | "doctor";

function safeInternalPath(next: string | null): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("://")) {
    return null;
  }
  return next;
}

export default function AuthPageClient() {
  const params = useSearchParams();
  const nextAfterAuth = safeInternalPath(params.get("next"));
  const defaultMode = params.get("mode") === "signup" ? "signup" : "login";
  const [mode, setMode] = React.useState<"login" | "signup">(defaultMode);
  const [role, setRole] = React.useState<RoleChoice>("student");
  const [photo, setPhoto] = React.useState<string | null>(null);
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [touched, setTouched] = React.useState(false);
  const [formError, setFormError] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const emailError =
    touched && !email.includes("@") ? "Please enter a valid email address." : "";
  const passwordError =
    touched && password.length < 6 ? "Password must be at least 6 characters." : "";

  async function uploadAvatarIfNeeded(userId: string, file: File | null) {
    if (!file) return;
    const path = `${userId}/${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
    const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, {
      upsert: true
    });
    if (upErr) {
      console.error(upErr);
      return;
    }
    const {
      data: { publicUrl }
    } = supabase.storage.from("avatars").getPublicUrl(path);
    await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", userId);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    setFormError("");
    if (!email.includes("@") || password.length < 6) return;

    setSubmitting(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password
        });

        if (error) {
          setFormError(error.message);
          return;
        }

        const user = data.user;
        if (!user) {
          setFormError("Account could not be created. Try again.");
          return;
        }

        const { error: profileError } = await supabase.from("profiles").upsert(
          {
            id: user.id,
            role,
            email,
            full_name: "",
            open_to_shadowing: role === "doctor" ? false : null
          },
          { onConflict: "id" }
        );

        if (profileError) {
          setFormError(profileError.message);
          return;
        }

        if (role === "student") {
          const { error: hoursErr } = await supabase.from("student_hours").upsert(
            { user_id: user.id },
            { onConflict: "user_id", ignoreDuplicates: true }
          );
          if (hoursErr) {
            setFormError(hoursErr.message);
            return;
          }
        }

        await uploadAvatarIfNeeded(user.id, avatarFile);

        router.push(
          nextAfterAuth ?? (role === "doctor" ? "/doctor" : "/student")
        );
        router.refresh();
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setFormError(error.message);
        return;
      }

      const uid = data.user?.id;
      if (!uid) {
        setFormError("Could not read session.");
        return;
      }

      const { data: prof, error: profErr } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", uid)
        .single();

      if (profErr || !prof) {
        setFormError("Profile not found. Complete sign up first.");
        return;
      }

      router.push(
        nextAfterAuth ?? (prof.role === "doctor" ? "/doctor" : "/student")
      );
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <div className="grid gap-8 md:grid-cols-2 md:items-start">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-soft">
            <span className="h-2 w-2 rounded-full bg-brand-600" />
            Synapse — pre‑med networking
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            {mode === "signup" ? "Create your account" : "Welcome back"}
          </h1>
          <p className="text-sm text-slate-600">
            Choose whether you are a student or a doctor, then sign in with Supabase Auth.
            Build your profile after you land on your dashboard.
          </p>

          <div className="flex flex-wrap gap-2">
            <Link href="/">
              <Button variant="secondary">Home</Button>
            </Link>
          </div>
        </div>

        <Card className="shadow-card">
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-900">
                {mode === "signup" ? "Sign up" : "Log in"}
              </div>
              <button
                type="button"
                className="text-sm font-medium text-brand-700 hover:text-brand-800"
                onClick={() => setMode(mode === "signup" ? "login" : "signup")}
              >
                {mode === "signup" ? "Switch to log in" : "Switch to sign up"}
              </button>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setRole("student")}
                className={[
                  "rounded-2xl border p-4 text-left shadow-soft transition",
                  role === "student"
                    ? "border-brand-200 bg-brand-50 ring-1 ring-brand-100"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                ].join(" ")}
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-900">I am a Student</div>
                  {role === "student" ? <Badge variant="brand">Selected</Badge> : null}
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  Build a profile, message doctors, and discover shadowing.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole("doctor")}
                className={[
                  "rounded-2xl border p-4 text-left shadow-soft transition",
                  role === "doctor"
                    ? "border-brand-200 bg-brand-50 ring-1 ring-brand-100"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                ].join(" ")}
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-900">I am a Doctor</div>
                  {role === "doctor" ? <Badge variant="brand">Selected</Badge> : null}
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  Share availability and mentor pre‑med students.
                </div>
              </button>
            </div>

            {mode === "signup" ? (
              <ProfilePictureUpload
                name=""
                value={photo}
                onChange={setPhoto}
                onFileSelect={setAvatarFile}
              />
            ) : null}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <Input
                label="Email"
                placeholder="name@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={emailError || undefined}
              />
              <Input
                label="Password"
                placeholder="••••••••"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={passwordError || undefined}
              />

              {formError ? (
                <p className="text-sm text-rose-600" role="alert">
                  {formError}
                </p>
              ) : null}

              <Button
                type="submit"
                className="w-full"
                onClick={() => setTouched(true)}
                isLoading={submitting}
                disabled={submitting}
              >
                {mode === "signup" ? "Create account" : "Log in"}
              </Button>

              <div className="text-xs text-slate-500">
                By continuing, you agree to respectful outreach and patient privacy expectations.
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
