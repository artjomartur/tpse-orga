"use client";

import { useEffect, useMemo, useState } from "react";

type SubmissionDto = {
  id: string;
  type: string;
  fileUrl: string | null;
  status: string;
  submittedAt: string;
  grade?: { points?: number | null; feedback?: string | null } | null;
};

export default function MySubmissionsPage() {
  const [submissions, setSubmissions] = useState<SubmissionDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [type, setType] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/my-submissions");
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

  const canSubmit = useMemo(() => type.trim().length > 0 && !!file && !uploading, [type, file, uploading]);

  async function onUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setError(null);

    const fd = new FormData();
    fd.append("type", type.trim());
    fd.append("file", file);

    try {
      const res = await fetch("/api/my-submissions", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Upload fehlgeschlagen");
      // Reset input.
      setType("");
      setFile(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Meine Abgaben</h1>
        <p className="text-sm text-gray-700">Datei hochladen und Status/Feedback ansehen.</p>
      </div>

      <div className="rounded border bg-white p-4">
        <h2 className="font-semibold">Neue Einreichung</h2>
        <form className="mt-4 space-y-3" onSubmit={onUpload}>
          <div className="space-y-1">
            <label className="text-sm text-gray-700">Abgabetyp</label>
            <input
              className="w-full rounded border px-3 py-2 text-sm"
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="z.B. Analysebericht / Design / Präsentation ..."
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-gray-700">Datei</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="w-full text-sm"
              required
            />
          </div>

          {error ? <div className="text-sm text-red-600">{error}</div> : null}

          <button
            type="submit"
            disabled={!canSubmit}
            className="rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {uploading ? "Upload..." : "Einreichen"}
          </button>
        </form>
      </div>

      <div className="rounded border bg-white p-4">
        <h2 className="font-semibold">Übersicht</h2>

        {loading ? <div className="mt-3 text-sm text-gray-700">Lade...</div> : null}
        {!loading && submissions.length === 0 ? (
          <div className="mt-3 text-sm text-gray-700">Noch keine Abgaben.</div>
        ) : null}

        <div className="mt-4 space-y-3">
          {submissions.map((s) => (
            <div key={s.id} className="rounded border p-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{s.type}</div>
                  <div className="text-xs text-gray-500">{new Date(s.submittedAt).toLocaleString()}</div>
                  <div className="mt-1 text-sm text-gray-700">
                    Status: <span className="font-medium">{s.status}</span>
                  </div>
                  {s.grade ? (
                    <div className="mt-2 text-sm text-gray-700">
                      Punkte: <span className="font-medium">{s.grade.points ?? "—"}</span>
                      {s.grade.feedback ? <div className="mt-1 text-xs text-gray-600">{s.grade.feedback}</div> : null}
                    </div>
                  ) : null}
                </div>

                <div className="text-right">
                  {s.fileUrl ? (
                    <a className="text-sm underline" href={s.fileUrl} target="_blank" rel="noreferrer">
                      Datei öffnen
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
    </div>
  );
}


