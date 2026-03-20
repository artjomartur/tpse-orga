"use client";

import { useEffect, useMemo, useState } from "react";

type SubmissionDto = {
  id: string;
  type: string;
  status: string;
  submittedAt: string;
  fileUrl: string | null;
  team: { id: string; name: string; projectName: string | null };
  submittedBy: { id: string; email: string; name: string | null; role: string };
  grade: { id: string; points: number | null; feedback: string | null } | null;
};

export default function GradingPage() {
  const [submissions, setSubmissions] = useState<SubmissionDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = useMemo(() => submissions.find((s) => s.id === selectedId) ?? null, [submissions, selectedId]);

  const [pointsInput, setPointsInput] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");

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

  useEffect(() => {
    if (!selected) return;
    setPointsInput(selected.grade?.points !== null && selected.grade?.points !== undefined ? String(selected.grade.points) : "");
    setFeedback(selected.grade?.feedback ?? "");
  }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  const canSave = useMemo(() => !!selectedId && !loading, [selectedId, loading]);

  async function saveGrade(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId) return;

    setError(null);
    setLoading(true);
    try {
      const points =
        pointsInput.trim().length === 0 ? null : Number(pointsInput.trim());
      if (points !== null && !Number.isFinite(points)) {
        throw new Error("Punkte müssen eine Zahl sein oder leer bleiben.");
      }

      const res = await fetch(`/api/submissions/${selectedId}/grade`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ points, feedback: feedback.trim() ? feedback.trim() : null }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Bewertung speichern fehlgeschlagen");

      // Update local state
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unbekannter Fehler");
    } finally {
      setLoading(false);
    }
  }

  const submissionsNeedingGrade = useMemo(
    () => submissions.filter((s) => !s.grade || s.grade.points === null),
    [submissions],
  );

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold">Bewertung</h1>
        <p className="text-sm text-gray-700">Punkte und Feedback pro Einreichung vergeben.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 rounded border bg-white p-4">
          <h2 className="font-semibold">Einreichungen</h2>

          {loading ? <div className="mt-3 text-sm text-gray-700">Lade...</div> : null}
          {!loading && submissionsNeedingGrade.length === 0 ? (
            <div className="mt-3 text-sm text-gray-700">Keine offenen Bewertungen.</div>
          ) : null}

          <div className="mt-4 space-y-2">
            {submissionsNeedingGrade.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`w-full rounded border px-3 py-2 text-left text-sm ${
                  selectedId === s.id ? "border-blue-300 bg-blue-50" : "bg-white"
                }`}
                onClick={() => setSelectedId(s.id)}
              >
                <div className="font-medium">{s.type}</div>
                <div className="text-xs text-gray-600">
                  {s.team.name} • {s.submittedBy.email}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 rounded border bg-white p-4">
          <h2 className="font-semibold">Bewertungsformular</h2>

          {!selected ? (
            <div className="mt-3 text-sm text-gray-700">Wähle links eine Einreichung aus.</div>
          ) : (
            <>
              <div className="mt-3 rounded bg-gray-50 p-3 text-sm">
                <div className="font-medium">{selected.type}</div>
                <div className="text-gray-700">
                  Team: <span className="font-medium">{selected.team.name}</span>
                </div>
                <div className="text-gray-700">
                  Status: <span className="font-medium">{selected.status}</span>
                </div>
                <div className="text-xs text-gray-600">
                  Eingereicht: {new Date(selected.submittedAt).toLocaleString()}
                </div>
              </div>

              <form className="mt-4 space-y-3" onSubmit={saveGrade}>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-sm text-gray-700">Punkte</label>
                    <input
                      className="w-full rounded border px-3 py-2 text-sm"
                      value={pointsInput}
                      onChange={(e) => setPointsInput(e.target.value)}
                      placeholder="z.B. 8.5 (leer = keine Punkte)"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm text-gray-700">Datei</label>
                    {selected.fileUrl ? (
                      <a
                        className="block w-fit rounded bg-gray-100 px-3 py-2 text-sm underline"
                        href={selected.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Datei öffnen
                      </a>
                    ) : (
                      <div className="text-sm text-gray-500">Keine Datei</div>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm text-gray-700">Feedback</label>
                  <textarea
                    className="min-h-[120px] w-full rounded border px-3 py-2 text-sm"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Kurzes Feedback zur Einreichung..."
                  />
                </div>

                {error ? <div className="text-sm text-red-600">{error}</div> : null}

                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={!canSave}
                    className="rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
                  >
                    {loading ? "Speichere..." : "Speichern"}
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => setSelectedId(null)}
                    className="rounded border px-3 py-2 text-sm font-medium disabled:opacity-50"
                  >
                    Abwählen
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

