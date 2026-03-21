"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Project = {
  id: string;
  title: string;
  description: string | null;
  sortOrder: number;
};

const emptySlots = (): (string | null)[] => [null, null, null, null, null];

type Props = {
  hasTeam: boolean;
  onUpdated?: () => void;
  /** Wenn false, keine Überschrift in der Sektion (Seite bringt &lt;h1&gt; mit). */
  showHeading?: boolean;
};

export default function ProjectPreferencesSection({ hasTeam, onUpdated, showHeading = true }: Props) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [favorites, setFavorites] = useState<(string | null)[]>(emptySlots);
  const [nies, setNies] = useState<(string | null)[]>(emptySlots);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedHint, setSavedHint] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/student/project-preferences");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Projekte konnten nicht geladen werden.");
      setProjects((data.projects ?? []) as Project[]);
      if (data.favorites && Array.isArray(data.favorites)) {
        const fav = data.favorites.map((p: Project | null) => (p && p.id ? p.id : null)) as (string | null)[];
        while (fav.length < 5) fav.push(null);
        setFavorites(fav.slice(0, 5));
      } else {
        setFavorites(emptySlots());
      }
      if (data.nies && Array.isArray(data.nies)) {
        const nie = data.nies.map((p: Project | null) => (p && p.id ? p.id : null)) as (string | null)[];
        while (nie.length < 5) nie.push(null);
        setNies(nie.slice(0, 5));
      } else {
        setNies(emptySlots());
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

  const projectById = useMemo(() => {
    const m = new Map<string, Project>();
    for (const p of projects) m.set(p.id, p);
    return m;
  }, [projects]);

  function setFavoriteSlot(index: number, projectId: string | null) {
    const next = [...favorites];
    next[index] = projectId;
    setFavorites(next);
  }

  function setNieSlot(index: number, projectId: string | null) {
    const next = [...nies];
    next[index] = projectId;
    setNies(next);
  }

  async function save() {
    setLoading(true);
    setError(null);
    setSavedHint(null);
    try {
      const res = await fetch("/api/student/project-preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ favorites, nies }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Speichern fehlgeschlagen.");
      setSavedHint("Gespeichert.");
      await load();
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
          <h2 className="text-lg font-semibold text-slate-800">Projektwahl (5 Favoriten, 5 Nieten)</h2>
        ) : null}
        <p className={`text-sm text-slate-600 ${showHeading ? "mt-2" : ""}`}>
          Sobald du einem Team zugeordnet bist, könnt ihr hier eure Präferenzen festhalten (Plätze 1–5 je für
          Favoriten und Nieten).
        </p>
      </section>
    );
  }

  return (
    <section className="rounded border border-slate-200 bg-white p-4 shadow-sm">
      {showHeading ? (
        <>
          <h2 className="text-lg font-semibold text-slate-900">Projektwahl (mit der Gruppe)</h2>
          <p className="mt-1 text-sm text-slate-600">
            Pro Team: bis zu <strong>5 Favoriten</strong> (Rang 1–5) und bis zu <strong>5 Nieten</strong>. Jedes Projekt
            höchstens einmal; kein Projekt gleichzeitig Favorit und Niete.
          </p>
        </>
      ) : (
        <p className="text-sm text-slate-600">
          Pro Team: bis zu <strong>5 Favoriten</strong> (Rang 1–5) und bis zu <strong>5 Nieten</strong>. Jedes Projekt
          höchstens einmal; kein Projekt gleichzeitig Favorit und Niete.
        </p>
      )}

      <div className="mt-4 grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold text-emerald-900">Favoriten (Platz 1 = wichtigster)</h3>
          <div className="mt-2 space-y-2">
            {favorites.map((val, i) => (
              <div key={`f-${i}`} className="flex items-center gap-2 text-sm">
                <span className="w-8 shrink-0 text-slate-500">{i + 1}.</span>
                <select
                  className="w-full rounded border border-slate-300 px-2 py-1.5"
                  value={val ?? ""}
                  onChange={(e) => setFavoriteSlot(i, e.target.value || null)}
                  disabled={loading}
                >
                  <option value="">— frei —</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-rose-900">Nieten</h3>
          <div className="mt-2 space-y-2">
            {nies.map((val, i) => (
              <div key={`n-${i}`} className="flex items-center gap-2 text-sm">
                <span className="w-8 shrink-0 text-slate-500">{i + 1}.</span>
                <select
                  className="w-full rounded border border-slate-300 px-2 py-1.5"
                  value={val ?? ""}
                  onChange={(e) => setNieSlot(i, e.target.value || null)}
                  disabled={loading}
                >
                  <option value="">— frei —</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={loading}
          className="rounded bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
        >
          {loading ? "Speichere…" : "Präferenzen speichern"}
        </button>
        {savedHint ? <span className="text-sm text-emerald-700">{savedHint}</span> : null}
      </div>

      <details className="mt-4 text-xs text-slate-500">
        <summary className="cursor-pointer">Kurzübersicht</summary>
        <ul className="mt-2 list-inside list-disc space-y-1">
          {favorites.map((id, i) =>
            id ? (
              <li key={`sf-${i}`}>
                Favorit {i + 1}: {projectById.get(id)?.title ?? id}
              </li>
            ) : null,
          )}
          {nies.map((id, i) =>
            id ? (
              <li key={`sn-${i}`}>
                Niete {i + 1}: {projectById.get(id)?.title ?? id}
              </li>
            ) : null,
          )}
        </ul>
      </details>

      {error ? <div className="mt-2 text-sm text-red-600">{error}</div> : null}
    </section>
  );
}
