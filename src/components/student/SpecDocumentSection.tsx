"use client";

import { useCallback, useEffect, useState } from "react";

type Props = {
  hasTeam: boolean;
  onUpdated?: () => void;
  showHeading?: boolean;
};

export default function SpecDocumentSection({ hasTeam, onUpdated, showHeading = true }: Props) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [uploadedAt, setUploadedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/student/team-spec");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Status konnte nicht geladen werden.");
      if (data.spec) {
        setFileName(data.spec.fileName ?? null);
        setExtractedText(data.spec.extractedText ?? null);
        setUploadedAt(data.spec.uploadedAt ?? null);
      } else {
        setFileName(null);
        setExtractedText(null);
        setUploadedAt(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function upload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await fetch("/api/student/team-spec", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Upload fehlgeschlagen.");
      setFile(null);
      setFileName(data.spec?.fileName ?? null);
      setExtractedText(data.spec?.extractedText ?? null);
      setUploadedAt(data.spec?.uploadedAt ?? null);
      onUpdated?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler");
    } finally {
      setLoading(false);
    }
  }

  if (!hasTeam) {
    return (
      <section className="rounded border border-dashed border-slate-300 bg-slate-50 p-4">
        {showHeading ? (
          <h2 className="text-lg font-semibold text-slate-800">Spezifikationsdokument (PDF)</h2>
        ) : null}
        <p className={`text-sm text-slate-600 ${showHeading ? "mt-2" : ""}`}>
          Wenn du in einem Team bist, könnt ihr hier ein PDF hochladen. Der Text wird automatisch extrahiert und
          lesbar angezeigt (eine Datei pro Team, Upload ersetzt die vorherige).
        </p>
      </section>
    );
  }

  return (
    <section className="rounded border border-slate-200 bg-white p-4 shadow-sm">
      {showHeading ? (
        <>
          <h2 className="text-lg font-semibold text-slate-900">Spezifikationsdokument (PDF → Text)</h2>
          <p className="mt-1 text-sm text-slate-600">
            Eine PDF-Datei pro Team. Nach dem Upload wird der Inhalt als Text dargestellt (einfache Extraktion, keine
            Layout-Garantie bei komplexen PDFs).
          </p>
        </>
      ) : (
        <p className="text-sm text-slate-600">
          Eine PDF-Datei pro Team. Nach dem Upload wird der Inhalt als Text dargestellt (einfache Extraktion, keine
          Layout-Garantie bei komplexen PDFs).
        </p>
      )}

      <form onSubmit={upload} className="mt-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600">PDF wählen</label>
          <input
            type="file"
            accept="application/pdf,.pdf"
            disabled={loading}
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="mt-1 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !file}
          className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          Hochladen &amp; Text extrahieren
        </button>
      </form>

      {fileName ? (
        <div className="mt-4 rounded border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          <span className="font-medium">Aktuelle Datei:</span> {fileName}
          {uploadedAt ? (
            <span className="ml-2 text-xs text-slate-500">
              ({new Date(uploadedAt).toLocaleString("de-DE")})
            </span>
          ) : null}
        </div>
      ) : null}

      {extractedText ? (
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-slate-800">Extrahierter Text</h3>
          <pre className="mt-2 max-h-[480px] overflow-auto whitespace-pre-wrap rounded border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800">
            {extractedText}
          </pre>
        </div>
      ) : fileName ? (
        <p className="mt-4 text-sm text-amber-800">Kein Text extrahiert (evtl. gescannte PDF ohne Textlayer).</p>
      ) : null}

      {loading ? <div className="mt-2 text-xs text-slate-500">Lade…</div> : null}
      {error ? <div className="mt-2 text-sm text-red-600">{error}</div> : null}
    </section>
  );
}
