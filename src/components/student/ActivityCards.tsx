"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Milestone = {
  key: string;
  title: string;
  done: boolean;
  overdue: boolean;
  blocked: boolean;
};

const routes: Record<string, string> = {
  JOIN_TEAM: "/student/team",
  PROJECT_PREFERENCES: "/student/projects",
  SPEC_UPLOAD: "/student/spec",
};

export default function ActivityCards() {
  const [items, setItems] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/student/milestones");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return;
      setItems((data.milestones ?? []) as Milestone[]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return <div className="text-sm text-slate-500">Aktivitäten werden geladen…</div>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((m) => {
        const href = routes[m.key] ?? "#";
        const status = m.done ? "Erledigt" : m.overdue ? "Überfällig" : m.blocked ? "Gesperrt" : "Offen";
        const color = m.done
          ? "border-emerald-200 bg-emerald-50"
          : m.overdue
            ? "border-red-300 bg-red-50"
            : m.blocked
              ? "border-slate-200 bg-slate-100"
              : "border-amber-200 bg-amber-50";

        return (
          <Link
            key={m.key}
            href={href}
            className={`flex flex-col rounded-xl border p-4 shadow-sm transition hover:shadow-md ${color}`}
          >
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">Aktivität</span>
            <span className="mt-1 text-base font-semibold text-slate-900">{m.title}</span>
            <span className="mt-3 text-sm font-medium text-slate-700">{status}</span>
            <span className="mt-2 text-xs text-slate-600">Zur Seite →</span>
          </Link>
        );
      })}
    </div>
  );
}
