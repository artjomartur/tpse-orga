"use client";

import ProjectPreferencesSection from "@/components/student/ProjectPreferencesSection";
import { useStudentTeam } from "@/hooks/useStudentTeam";

export default function StudentProjectsPage() {
  const { hasTeam, loading, error } = useStudentTeam();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Projektwahl</h1>
        <p className="mt-1 text-sm text-slate-600">
          Fünf Favoriten (Rang 1–5) und fünf Nieten – gemeinsam als Team speichern.
        </p>
      </div>
      {loading ? <p className="text-sm text-slate-500">Lade Teamstatus…</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <ProjectPreferencesSection hasTeam={hasTeam} showHeading={false} />
    </div>
  );
}
