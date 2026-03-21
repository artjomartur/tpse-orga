"use client";

import { useEffect, useState } from "react";

type GradeDto = {
  id: string;
  points: number | null;
  feedback: string | null;
  submission: {
    id: string;
    type: string;
    fileUrl: string | null;
    status: string;
    submittedAt: string;
  };
};

export default function MyGradesPage() {
  const [grades, setGrades] = useState<GradeDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/my-grades");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Fehler beim Laden");
      setGrades((data.grades ?? []) as GradeDto[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unbekannter Fehler");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold dark:text-slate-100">Meine Bewertungen</h1>
        <p className="text-sm text-gray-700 dark:text-slate-400">Punkte und Feedback zu deinen Einreichungen.</p>
      </div>

      <div className="rounded-2xl border border-slate-200/60 bg-white/50 backdrop-blur-md p-6 shadow-sm dark:bg-slate-900/50 dark:border-slate-800/60">
        <h2 className="font-semibold dark:text-slate-100">Übersicht</h2>

        {loading ? <div className="mt-3 text-sm text-gray-700 dark:text-slate-400">Lade...</div> : null}
        {!loading && grades.length === 0 ? (
          <div className="mt-3 text-sm text-gray-700 dark:text-slate-400">Noch keine Bewertungen vorhanden.</div>
        ) : null}

        <div className="mt-4 space-y-3">
          {grades.map((g) => (
            <div key={g.id} className="rounded border border-slate-200 p-3 dark:border-slate-700 dark:bg-slate-800/50">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-semibold dark:text-slate-100">{g.submission.type}</div>
                  <div className="text-xs text-gray-500 dark:text-slate-400">{new Date(g.submission.submittedAt).toLocaleString()}</div>
                  <div className="mt-1 text-sm text-gray-700 dark:text-slate-300">
                    Punkte:{" "}
                    <span className="font-medium dark:text-slate-100">{g.points ?? "—"}</span>
                    {g.feedback ? <div className="mt-1 text-xs text-gray-600 dark:text-slate-400">{g.feedback}</div> : null}
                  </div>
                </div>
                <div className="text-right">
                  {g.submission.fileUrl ? (
                    <a className="text-sm underline hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300" href={g.submission.fileUrl} target="_blank" rel="noreferrer">
                      Datei öffnen
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {error ? <div className="text-sm text-red-600">{error}</div> : null}
    </div>
  );
}


