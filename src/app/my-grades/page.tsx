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
        <h1 className="text-xl font-bold">Meine Bewertungen</h1>
        <p className="text-sm text-gray-700">Punkte und Feedback zu deinen Einreichungen.</p>
      </div>

      <div className="rounded border bg-white p-4">
        <h2 className="font-semibold">Übersicht</h2>

        {loading ? <div className="mt-3 text-sm text-gray-700">Lade...</div> : null}
        {!loading && grades.length === 0 ? (
          <div className="mt-3 text-sm text-gray-700">Noch keine Bewertungen vorhanden.</div>
        ) : null}

        <div className="mt-4 space-y-3">
          {grades.map((g) => (
            <div key={g.id} className="rounded border p-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{g.submission.type}</div>
                  <div className="text-xs text-gray-500">{new Date(g.submission.submittedAt).toLocaleString()}</div>
                  <div className="mt-1 text-sm text-gray-700">
                    Punkte:{" "}
                    <span className="font-medium">{g.points ?? "—"}</span>
                    {g.feedback ? <div className="mt-1 text-xs text-gray-600">{g.feedback}</div> : null}
                  </div>
                </div>
                <div className="text-right">
                  {g.submission.fileUrl ? (
                    <a className="text-sm underline" href={g.submission.fileUrl} target="_blank" rel="noreferrer">
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


