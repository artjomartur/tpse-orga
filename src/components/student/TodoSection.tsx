"use client";

import { useCallback, useEffect, useState } from "react";

type Milestone = {
  key: string;
  title: string;
  description: string;
  deadline: string | null;
  deadlineSet: boolean;
  done: boolean;
  blocked: boolean;
  blockedReason: string | null;
  overdue: boolean;
  urgent: boolean;
  daysRemaining: number | null;
};

type Todo = {
  id: string;
  title: string;
  done: boolean;
  sortOrder: number;
};

type Props = {
  teamId: string | null;
  reloadKey?: number;
};

function formatDeadline(iso: string | null, deadlineSet: boolean) {
  if (!deadlineSet || !iso) return "Frist nicht konfiguriert (Admin: MILESTONE_DEADLINE_* in .env)";
  try {
    return new Date(iso).toLocaleString("de-DE", { dateStyle: "full", timeStyle: "short" });
  } catch {
    return iso;
  }
}

export default function TodoSection({ teamId, reloadKey = 0 }: Props) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [summary, setSummary] = useState<{ openCount: number; overdueCount: number } | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMilestones = useCallback(async () => {
    try {
      const res = await fetch("/api/student/milestones");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Meilensteine konnten nicht geladen werden.");
      setMilestones((data.milestones ?? []) as Milestone[]);
      setSummary(data.summary ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler");
    }
  }, []);

  const loadManual = useCallback(async () => {
    try {
      const res = await fetch("/api/student/todos");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Notizen konnten nicht geladen werden.");
      setTodos((data.todos ?? []) as Todo[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler");
    }
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    await loadMilestones();
    await loadManual();
    setLoading(false);
  }, [loadMilestones, loadManual]);

  useEffect(() => {
    loadAll();
  }, [loadAll, teamId, reloadKey]);

  async function addTodo(e: React.FormEvent) {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/student/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Anlegen fehlgeschlagen.");
      setNewTitle("");
      await loadManual();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler");
    } finally {
      setLoading(false);
    }
  }

  async function toggleDone(t: Todo) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/student/todos/${t.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done: !t.done }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Speichern fehlgeschlagen.");
      await loadManual();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler");
    } finally {
      setLoading(false);
    }
  }

  async function remove(t: Todo) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/student/todos/${t.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Löschen fehlgeschlagen.");
      await loadManual();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler");
    } finally {
      setLoading(false);
    }
  }

  const openMilestones = milestones.filter((m) => !m.done);
  const doneMilestones = milestones.filter((m) => m.done);

  return (
    <section className="rounded-2xl border border-slate-200/60 bg-white/50 backdrop-blur-md p-6 shadow-sm dark:bg-slate-900/50 dark:border-slate-800/60">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Pflicht-Checkliste &amp; Fristen</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Diese Punkte werden <strong>automatisch</strong> als offen angezeigt, solange die Aktivität noch nicht
            erfüllt ist. Die Fristen sind <strong>verbindlich</strong> (siehe Umgebungsvariablen{" "}
            <code className="rounded bg-slate-100 px-1 text-xs dark:bg-slate-800">MILESTONE_DEADLINE_*</code>).
          </p>
        </div>
        {summary ? (
          <div className="text-right text-sm">
            {summary.overdueCount > 0 ? (
              <div className="font-semibold text-red-700 dark:text-red-400">{summary.overdueCount} überfällig</div>
            ) : (
              <div className="text-emerald-700 dark:text-emerald-400">Keine überfälligen Pflichten</div>
            )}
            <div className="text-slate-500 dark:text-slate-400">{summary.openCount} offen (gesamt)</div>
          </div>
        ) : null}
      </div>

      <ul className="mt-4 space-y-3">
        {openMilestones.map((m) => {
          const base =
            m.overdue && !m.done
              ? "border-red-500 bg-red-50 ring-1 ring-red-200 dark:border-red-900/50 dark:bg-red-900/20 dark:ring-red-900/30"
              : m.urgent && !m.done
                ? "border-amber-400 bg-amber-50 ring-1 ring-amber-100 dark:border-amber-900/50 dark:bg-amber-900/20 dark:ring-amber-900/30"
                : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50";
          return (
            <li key={m.key} className={`rounded-lg border px-4 py-3 ${base}`}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">{m.title}</div>
                  <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{m.description}</p>
                  {m.blocked && m.blockedReason ? (
                    <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-400">{m.blockedReason}</p>
                  ) : null}
                </div>
                <div className="text-right text-sm">
                  {m.overdue && !m.done ? (
                    <span className="font-bold text-red-700 dark:text-red-400">Frist überschritten</span>
                  ) : m.urgent && !m.done && m.daysRemaining !== null ? (
                    <span className="font-semibold text-amber-800 dark:text-amber-400">Noch {m.daysRemaining} Tag(e)</span>
                  ) : !m.done && m.daysRemaining !== null && m.daysRemaining >= 0 ? (
                    <span className="text-slate-600 dark:text-slate-400">Noch {m.daysRemaining} Tag(e)</span>
                  ) : null}
                </div>
              </div>
              <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                <span className="font-medium text-slate-700 dark:text-slate-300">Fristende: </span>
                {formatDeadline(m.deadline, m.deadlineSet)}
              </div>
            </li>
          );
        })}
      </ul>

      {doneMilestones.length > 0 ? (
        <details className="mt-4 rounded border border-emerald-200 bg-emerald-50/60 px-3 py-2 dark:border-emerald-900/50 dark:bg-emerald-900/20">
          <summary className="cursor-pointer text-sm font-medium text-emerald-900 dark:text-emerald-300">
            Erledigte Pflichten ({doneMilestones.length})
          </summary>
          <ul className="mt-2 space-y-1 text-sm text-emerald-900/90 dark:text-emerald-300/90">
            {doneMilestones.map((m) => (
              <li key={m.key}>✓ {m.title}</li>
            ))}
          </ul>
        </details>
      ) : null}

      <div className="mt-6 border-t border-slate-200 pt-4 dark:border-slate-800/60">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Eigene Notizen (optional)</h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Zusätzliche Erinnerungen nur für dich — unabhängig von den Pflichtfristen.</p>

        <form onSubmit={addTodo} className="mt-3 flex flex-wrap gap-2">
          <input
            className="min-w-[200px] flex-1 rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-100"
            placeholder="Neue Notiz…"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !newTitle.trim()}
            className="rounded bg-slate-700 px-3 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-slate-600 dark:hover:bg-slate-500"
          >
            Hinzufügen
          </button>
        </form>

        <ul className="mt-3 space-y-2">
          {todos.length === 0 && !loading ? (
            <li className="text-sm text-slate-500 dark:text-slate-400">Keine eigenen Notizen.</li>
          ) : null}
          {todos.map((t) => (
            <li
              key={t.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded border border-slate-100 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900/50"
            >
              <label className="flex cursor-pointer items-center gap-2">
                <input type="checkbox" checked={t.done} onChange={() => toggleDone(t)} disabled={loading} />
                <span className={t.done ? "text-slate-500 line-through dark:text-slate-500" : "text-slate-900 dark:text-slate-100"}>{t.title}</span>
              </label>
              <button
                type="button"
                onClick={() => remove(t)}
                disabled={loading}
                className="text-xs text-red-700 hover:underline disabled:opacity-50 dark:text-red-400"
              >
                Löschen
              </button>
            </li>
          ))}
        </ul>
      </div>

      {loading ? <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">Lade…</div> : null}
      {error ? <div className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</div> : null}
    </section>
  );
}
