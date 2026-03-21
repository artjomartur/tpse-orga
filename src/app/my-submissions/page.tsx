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
        <h1 className="text-xl font-bold dark:text-slate-100">Meine Abgaben</h1>
        <p className="text-sm text-gray-700 dark:text-slate-400">Datei hochladen und Status/Feedback ansehen.</p>
      </div>

      <div className="rounded-2xl border border-slate-200/60 bg-white/50 backdrop-blur-md p-6 shadow-sm dark:bg-slate-900/50 dark:border-slate-800/60">
        <h2 className="font-semibold dark:text-slate-100">Neue Einreichung</h2>
        <form className="mt-4 space-y-3" onSubmit={onUpload}>
          <div className="space-y-1">
            <label className="text-sm text-gray-700 dark:text-slate-400">Abgabetyp</label>
            <input
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm placeholder-slate-400 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-100"
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="z.B. Analysebericht / Design / Präsentation ..."
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-gray-700 dark:text-slate-400">Datei</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="w-full text-sm dark:text-slate-300"
              required
            />
          </div>

          {error ? <div className="text-sm text-red-600 dark:text-red-400">{error}</div> : null}

          <button
            type="submit"
            disabled={!canSubmit}
            className="rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-blue-500"
          >
            {uploading ? "Upload..." : "Einreichen"}
          </button>
        </form>
      </div>

      <div className="rounded-2xl border border-slate-200/60 bg-white/50 backdrop-blur-md p-6 shadow-sm dark:bg-slate-900/50 dark:border-slate-800/60">
        <h2 className="font-semibold dark:text-slate-100">Übersicht</h2>

        {loading ? <div className="mt-3 text-sm text-gray-700 dark:text-slate-400">Lade...</div> : null}
        {!loading && submissions.length === 0 ? (
          <div className="mt-3 text-sm text-gray-700 dark:text-slate-400">Noch keine Abgaben.</div>
        ) : null}

        <div className="mt-4 space-y-3">
          {submissions.map((s) => (
            <div key={s.id} className="rounded border border-slate-200 p-3 dark:border-slate-700 dark:bg-slate-800/50">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-semibold dark:text-slate-100">{s.type}</div>
                  <div className="text-xs text-gray-500 dark:text-slate-400">{new Date(s.submittedAt).toLocaleString()}</div>
                  <div className="mt-1 text-sm text-gray-700 dark:text-slate-300">
                    Status: <span className="font-medium dark:text-slate-100">{s.status}</span>
                  </div>
                  {s.grade ? (
                    <div className="mt-2 text-sm text-gray-700 dark:text-slate-300">
                      Punkte: <span className="font-medium dark:text-slate-100">{s.grade.points ?? "—"}</span>
                      {s.grade.feedback ? <div className="mt-1 text-xs text-gray-600 dark:text-slate-400">{s.grade.feedback}</div> : null}
                    </div>
                  ) : null}
                </div>

                <div className="text-right">
                  {s.fileUrl ? (
                    <a className="text-sm underline hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300" href={s.fileUrl} target="_blank" rel="noreferrer">
                      Datei öffnen
                    </a>
                  ) : (
                    <div className="text-sm text-gray-500 dark:text-slate-400">Keine Datei</div>
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


