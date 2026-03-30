"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProfilePictureUpload } from "@/components/profile/ProfilePictureUpload";

type RoleChoice = "student" | "doctor";

export default function AuthPage() {
  const params = useSearchParams();
  const defaultMode = params.get("mode") === "signup" ? "signup" : "login";
  const [mode, setMode] = React.useState<"login" | "signup">(defaultMode);
  const [role, setRole] = React.useState<RoleChoice>("student");
  const [photo, setPhoto] = React.useState<string | null>(null);

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [touched, setTouched] = React.useState(false);

  const emailError =
    touched && !email.includes("@") ? "Please enter a valid email address." : "";
  const passwordError =
    touched && password.length < 6
      ? "Password must be at least 6 characters."
      : "";

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <div className="grid gap-8 md:grid-cols-2 md:items-start">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-soft">
            <span className="h-2 w-2 rounded-full bg-brand-600" />
            Synapse authentication (mock)
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            {mode === "signup" ? "Create your account" : "Welcome back"}
          </h1>
          <p className="text-sm text-slate-600">
            Choose your role and enter your details. This is a UI demo using
            local state only.
          </p>

          <div className="flex flex-wrap gap-2">
            <Link href="/student">
              <Button variant="secondary">Student dashboard</Button>
            </Link>
            <Link href="/doctor">
              <Button variant="secondary">Doctor dashboard</Button>
            </Link>
            <Link href="/messages">
              <Button variant="secondary">Messages</Button>
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
                  <div className="text-sm font-semibold text-slate-900">
                    I am a Student
                  </div>
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
                  <div className="text-sm font-semibold text-slate-900">
                    I am a Doctor
                  </div>
                  {role === "doctor" ? <Badge variant="brand">Selected</Badge> : null}
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  Share availability and mentor pre‑med students.
                </div>
              </button>
            </div>

            {mode === "signup" ? (
              <ProfilePictureUpload
                name={role === "doctor" ? "Doctor" : "Student"}
                value={photo}
                onChange={setPhoto}
              />
            ) : null}

            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                setTouched(true);
              }}
            >
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

              <Button
                type="submit"
                className="w-full"
                onClick={() => setTouched(true)}
              >
                {mode === "signup" ? "Create account" : "Log in"}
              </Button>

              <div className="text-xs text-slate-500">
                By continuing, you agree to respectful outreach and patient
                privacy expectations. Demo only.
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

