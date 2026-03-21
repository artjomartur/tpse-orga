"use client";

import { useEffect, useState } from "react";

type SubmissionDto = {
  id: string;
  type: string;
  fileUrl: string | null;
  status: string;
  submittedAt: string;
  team: { id: string; name: string; project: { id: string; name: string } | null };
  submittedBy: { id: string; email: string; name: string | null; role: string };
  grade?: { points: number | null; feedback: string | null; id: string } | null;
};

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<SubmissionDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/submissions");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Fehler beim Laden");
      setSubmissions((data.submissions ?? []) as SubmissionDto[]);
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
        <h1 className="text-xl font-bold">Abgaben</h1>
        <p className="text-sm text-gray-700">Einreichungen und (falls vorhanden) Bewertungen.</p>
      </div>

      <div className="rounded border bg-white p-4">
        <h2 className="font-semibold">Übersicht</h2>

        {loading ? <div className="mt-3 text-sm text-gray-700">Lade...</div> : null}
        {!loading && submissions.length === 0 ? (
          <div className="mt-3 text-sm text-gray-700">Keine Einreichungen gefunden.</div>
        ) : null}

        <div className="mt-4 space-y-3">
          {submissions.map((s) => (
            <div key={s.id} className="rounded border p-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{s.type}</div>
                  <div className="text-sm text-gray-700">
                    Team: <span className="font-medium">{s.team?.name}</span>
                  </div>
                  <div className="text-xs text-gray-500">{new Date(s.submittedAt).toLocaleString()}</div>
                  <div className="mt-1 text-sm text-gray-700">
                    Status: <span className="font-medium">{s.status}</span>
                    {s.grade?.points !== undefined && s.grade ? (
                      <div className="mt-1 text-xs text-gray-600">
                        Punkte: <span className="font-medium text-gray-800">{s.grade.points ?? "—"}</span>
                        {s.grade.feedback ? <div className="mt-1">{s.grade.feedback}</div> : null}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="text-right">
                  {s.fileUrl ? (
                    <a className="text-sm underline" href={s.fileUrl} target="_blank" rel="noreferrer">
                      Datei
                    </a>
                  ) : (
                    <div className="text-sm text-gray-500">Keine Datei</div>
                  )}
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

