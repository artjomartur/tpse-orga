"use client";

import { useCallback, useEffect, useState } from "react";

import ActivityCards from "./ActivityCards";
import StudentSubNav from "./StudentSubNav";
import TodoSection from "./TodoSection";

export default function StudentOverview() {
  const [teamId, setTeamId] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const refreshTeam = useCallback(async () => {
    try {
      const res = await fetch("/api/student/overview");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return;
      const t = data?.team;
      setTeamId(t?.id ?? null);
      setReloadKey((k) => k + 1);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    refreshTeam();
  }, [refreshTeam]);

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-900">Deine Übersicht</h1>
        <p className="text-sm text-slate-600">
          Pflicht-Checkliste, dann die drei Aktivitäten – jeweils auf einer eigenen Seite über die Navigation.
        </p>
      </header>

      <StudentSubNav />

      <TodoSection teamId={teamId} reloadKey={reloadKey} />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Aktivitäten</h2>
        <p className="text-sm text-slate-600">Status-Karten – Klick führt zur jeweiligen Seite.</p>
        <ActivityCards />
      </section>

      <p className="text-xs text-slate-500">
        Weitere Bereiche: <a className="underline" href="/my-submissions">Meine Abgaben</a>,{" "}
        <a className="underline" href="/my-grades">Meine Noten</a>.
      </p>
    </div>
  );
}
