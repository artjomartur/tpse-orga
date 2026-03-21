import Link from "next/link";

export default function StaffHome() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">TPSE Orga</h1>
      <p className="text-sm text-gray-700">Angemeldet als HiWi oder Admin.</p>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/dashboard"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Zum Dashboard
        </Link>
        <Link href="/teams" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50">
          Teams
        </Link>
      </div>
    </div>
  );
}
