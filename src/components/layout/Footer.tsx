import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-200/70 bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-4">
        <div className="space-y-2">
          <div className="text-sm font-semibold text-slate-900">Synapse</div>
          <p className="text-sm text-slate-600">
            A professional network for pre-med students and physicians—built for
            safe, structured shadowing discovery.
          </p>
        </div>
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Product
          </div>
          <div className="grid gap-1 text-sm">
            <Link className="text-slate-700 hover:text-slate-900" href="/opportunities">
              Opportunities Near Me
            </Link>
            <Link className="text-slate-700 hover:text-slate-900" href="/messages">
              Messaging
            </Link>
            <Link className="text-slate-700 hover:text-slate-900" href="/auth">
              Sign in / Sign up
            </Link>
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Community
          </div>
          <div className="grid gap-1 text-sm">
            <Link className="text-slate-700 hover:text-slate-900" href="/student">
              Student dashboard
            </Link>
            <Link className="text-slate-700 hover:text-slate-900" href="/doctor">
              Doctor dashboard
            </Link>
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Trust
          </div>
          <p className="text-sm text-slate-600">
            Demo UI only. No PHI. No backend. All content is mock data for
            product prototyping.
          </p>
        </div>
      </div>
      <div className="border-t border-slate-200/70">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 text-xs text-slate-500">
          <span>© {new Date().getFullYear()} Synapse</span>
          <span>Designed for a healthcare-tech startup aesthetic.</span>
        </div>
      </div>
    </footer>
  );
}

