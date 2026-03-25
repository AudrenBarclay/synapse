import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-16">
      <div className="rounded-3xl border border-slate-200/70 bg-white p-10 shadow-card">
        <div className="text-sm font-semibold text-slate-900">Page not found</div>
        <p className="mt-2 text-sm text-slate-600">
          The page you’re looking for doesn’t exist in this demo yet.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href="/">
            <Button>Go to home</Button>
          </Link>
          <Link href="/opportunities">
            <Button variant="secondary">Explore opportunities</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}

