import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const q = await searchParams;
  if (q.next) {
    redirect(`/auth?next=${encodeURIComponent(q.next)}`);
  }
  redirect("/auth");
}
