"use client";

import { useEffect, useState } from "react";
import { Trash2, Calendar, FileText, Tag, AlignLeft } from "lucide-react";

type Assignment = {
  id: string;
  title: string;
  description: string | null;
  submissionType: string;
  deadline: string | null;
  createdAt: string;
  createdBy: { name: string | null; email: string };
};

const SUBMISSION_TYPES = ["PDF", "Link", "Code", "Präsentation", "Text", "Sonstiges"];

export default function HiwiAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submissionType, setSubmissionType] = useState("PDF");
  const [deadline, setDeadline] = useState("");

  const load = () => {
    fetch("/api/hiwi/assignments")
      .then((r) => r.json())
      .then((d) => { setAssignments(d.assignments || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/hiwi/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, submissionType, deadline: deadline || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Fehler beim Erstellen.");
      setTitle("");
      setDescription("");
      setSubmissionType("PDF");
      setDeadline("");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Aufgabe wirklich löschen?")) return;
    await fetch(`/api/hiwi/assignments/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Aufgaben für Studierende</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Erstelle Aufgaben mit Deadlines, Abgabetyp und Beschreibung. Alle Studierenden können diese sehen.
        </p>
      </div>

      {/* Create Form */}
      <form
        onSubmit={handleCreate}
        className="rounded-2xl border border-slate-200/60 bg-white/50 backdrop-blur-sm p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/50 space-y-5"
      >
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Neue Aufgabe erstellen</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">
              <Tag className="inline h-3.5 w-3.5 mr-1" />Titel *
            </label>
            <input
              required
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z.B. Meilenstein 1 – Anforderungsanalyse"
              className="w-full rounded-xl border border-slate-200/60 p-2.5 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-100 dark:placeholder-slate-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">
              <FileText className="inline h-3.5 w-3.5 mr-1" />Art der Abgabe *
            </label>
            <select
              value={submissionType}
              onChange={(e) => setSubmissionType(e.target.value)}
              className="w-full rounded-xl border border-slate-200/60 p-2.5 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-100"
            >
              {SUBMISSION_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">
            <AlignLeft className="inline h-3.5 w-3.5 mr-1" />Beschreibung / Notizen
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Anforderungen, Hinweise, Links..."
            className="w-full rounded-xl border border-slate-200/60 p-2.5 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-100 dark:placeholder-slate-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">
            <Calendar className="inline h-3.5 w-3.5 mr-1" />Deadline (optional)
          </label>
          <input
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="rounded-xl border border-slate-200/60 p-2.5 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-100"
          />
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-blue-600 px-6 py-2.5 font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Erstelle…" : "Aufgabe erstellen"}
        </button>
      </form>

      {/* Assignments List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Bestehende Aufgaben ({assignments.length})</h2>
        {loading ? (
          <p className="text-slate-500 dark:text-slate-400 text-sm">Lädt…</p>
        ) : assignments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-10 text-center text-sm text-slate-400 dark:text-slate-500">
            Noch keine Aufgaben erstellt.
          </div>
        ) : (
          assignments.map((a) => (
            <div key={a.id} className="group rounded-2xl border border-slate-200/60 bg-white/50 backdrop-blur-md p-5 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/50">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">{a.title}</h3>
                    <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/40 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300">
                      {a.submissionType}
                    </span>
                  </div>
                  {a.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap mt-1">{a.description}</p>
                  )}
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
                    {a.deadline && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Deadline: <strong className="text-slate-700 dark:text-slate-200">{new Date(a.deadline).toLocaleString("de-DE")}</strong>
                      </span>
                    )}
                    <span>Erstellt: {new Date(a.createdAt).toLocaleDateString("de-DE")}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(a.id)}
                  className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-all p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                  title="Löschen"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
