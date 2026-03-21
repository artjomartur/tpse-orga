"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { FileText, ChevronLeft } from "lucide-react";

const PdfAnnotator = dynamic(() => import("@/components/hiwi/PdfAnnotator"), { ssr: false });

type SpecEntry = {
  teamId: string;
  teamName: string;
  fileName: string;
  uploadedAt: string;
};

export default function HiwiSpecsPage() {
  const [specs, setSpecs] = useState<SpecEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<SpecEntry | null>(null);

  useEffect(() => {
    fetch("/api/hiwi/specs")
      .then((r) => r.json())
      .then((d) => { setSpecs(d.specs || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (selected) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelected(null)}
            className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Zurück zur Übersicht
          </button>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            {selected.teamName} — {selected.fileName}
          </h1>
        </div>
        <PdfAnnotator teamId={selected.teamId} teamName={selected.teamName} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Spezifikationsdokumente</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          PDFs der Teams einsehen und direkt kommentieren oder markieren.
        </p>
      </div>

      {loading ? (
        <p className="text-slate-500 dark:text-slate-400">Lädt…</p>
      ) : specs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-10 text-center text-sm text-slate-400 dark:text-slate-500">
          Noch keine PDFs hochgeladen.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {specs.map((s) => (
            <button
              key={s.teamId}
              onClick={() => setSelected(s)}
              className="group text-left p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-blue-100 dark:bg-blue-900/40 p-2.5 flex-shrink-0">
                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">{s.teamName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{s.fileName}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    {new Date(s.uploadedAt).toLocaleDateString("de-DE")}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
