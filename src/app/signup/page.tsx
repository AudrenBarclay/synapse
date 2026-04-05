import { redirect } from "next/navigation";

export default async function SignupPage({
  searchParams
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const q = await searchParams;
  const qs = new URLSearchParams({ mode: "signup" });
  if (q.next) qs.set("next", q.next);
  redirect(`/auth?${qs.toString()}`);
}
