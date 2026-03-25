import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600/30">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          <Link
            href="/opportunities"
            className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Opportunities
          </Link>
          <Link
            href="/messages"
            className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Messages
          </Link>
          <Link
            href="/student"
            className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Student
          </Link>
          <Link
            href="/doctor"
            className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Doctor
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/auth">
            <Button variant="secondary" size="sm">
              Log in
            </Button>
          </Link>
          <Link href="/auth?mode=signup">
            <Button size="sm">Sign up</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

