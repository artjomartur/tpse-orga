"use client";

import { useCallback, useEffect, useState } from "react";
import { MessageSquare, Trash2 } from "lucide-react";

interface Props {
  teamId: string;
  teamName: string;
}

type Annotation = {
  id: string;
  page: number;
  text: string;
  createdAt: string;
};

export default function PdfAnnotator({ teamId }: Props) {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [noteText, setNoteText] = useState("");
  const [page, setPage] = useState(1);
  const [saving, setSaving] = useState(false);

  const pdfUrl = `/api/hiwi/team-spec-pdf/${teamId}`;
  const annotationsUrl = `/api/hiwi/annotations/${teamId}`;

  const load = useCallback(() => {
    fetch(annotationsUrl)
      .then((r) => r.json())
      .then((d) => {
        if (d.annotations) {
          setAnnotations(
            d.annotations.map((a: { id: string; content: { page?: number; text?: string }; createdAt: string }) => ({
              id: a.id,
              page: a.content.page ?? 1,
              text: a.content.text ?? "",
              createdAt: a.createdAt,
            }))
          );
        }
      })
      .catch(console.error);
  }, [annotationsUrl]);

  useEffect(() => { load(); }, [load]);

  const addNote = async () => {
    if (!noteText.trim()) return;
    setSaving(true);
    try {
      await fetch(annotationsUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ annotation: { page, text: noteText.trim() } }),
      });
      setNoteText("");
      load();
    } finally {
      setSaving(false);
    }
  };

  const deleteNote = async (id: string) => {
    await fetch(annotationsUrl, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ annotationId: id }),
    });
    load();
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4" style={{ height: "calc(100vh - 220px)", minHeight: "500px" }}>
      {/* PDF via iframe */}
      <div className="flex-1 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <iframe
          src={pdfUrl}
          title="Spezifikation PDF"
          className="w-full h-full border-0"
          style={{ display: "block" }}
        />
      </div>

      {/* Annotation Sidebar */}
      <div className="w-full lg:w-72 flex-shrink-0 flex flex-col rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200/60 dark:border-slate-700/60">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="h-4 w-4 text-blue-500" />
            <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100">Notizen & Kommentare</h3>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <label className="text-xs text-slate-500 dark:text-slate-400 flex-shrink-0">Seite</label>
            <input
              type="number"
              min={1}
              value={page}
              onChange={(e) => setPage(Number(e.target.value))}
              className="w-16 rounded-lg border border-slate-200/60 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-sm dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Kommentar zur Seite…"
            rows={3}
            className="w-full rounded-xl border border-slate-200/60 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-sm dark:text-slate-100 dark:placeholder-slate-500 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
            onKeyDown={(e) => { if (e.key === "Enter" && e.metaKey) addNote(); }}
          />
          <button
            onClick={addNote}
            disabled={saving || !noteText.trim()}
            className="mt-2 w-full rounded-xl bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? "Speichert…" : "Hinzufügen"}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
          {annotations.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-400 dark:text-slate-500">
              Noch keine Notizen.
            </div>
          ) : (
            annotations.map((a) => (
              <div key={a.id} className="p-3 group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
                      Seite {a.page}
                    </span>
                    <p className="text-sm text-slate-800 dark:text-slate-100">{a.text}</p>
                  </div>
                  <button
                    onClick={() => deleteNote(a.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-all p-1 rounded flex-shrink-0"
                    title="Löschen"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="p-3 border-t border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-400 dark:text-slate-500 text-center">
          {annotations.length} Notiz{annotations.length !== 1 ? "en" : ""}
        </div>
      </div>
    </div>
  );
}
