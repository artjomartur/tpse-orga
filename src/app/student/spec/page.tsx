"use client";

import SpecDocumentSection from "@/components/student/SpecDocumentSection";
import { useStudentTeam } from "@/hooks/useStudentTeam";

export default function StudentSpecPage() {
  const { hasTeam, loading, error } = useStudentTeam();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Spezifikationsdokument</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">PDF hochladen – der Text wird auf der Seite lesbar dargestellt.</p>
      </div>
      {loading ? <p className="text-sm text-slate-500 dark:text-slate-400">Lade Teamstatus…</p> : null}
      {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
      <SpecDocumentSection hasTeam={hasTeam} showHeading={false} />
    </div>
  );
}
