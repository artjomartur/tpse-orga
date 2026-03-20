"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";

type ResourceDto = {
  id: string;
  title: string;
  url: string;
  category: string | null;
  createdAt: string;
};

export default function ResourcesPage() {
  const { data: session } = useSession();
  const role = session?.user?.role as string | undefined;
  const isHiwi = role === "HIWI" || role === "ADMIN";

  const [resources, setResources] = useState<ResourceDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("");

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/resources");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Fehler beim Laden");
      setResources((data.resources ?? []) as ResourceDto[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unbekannter Fehler");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function resetForm() {
    setSelectedId(null);
    setTitle("");
    setUrl("");
    setCategory("");
  }

  function startEdit(r: ResourceDto) {
    setSelectedId(r.id);
    setTitle(r.title);
    setUrl(r.url);
    setCategory(r.category ?? "");
  }

  const empty = useMemo(() => !loading && resources.length === 0, [loading, resources]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        title,
        url,
        category: category.trim() ? category.trim() : null,
      };

      if (!selectedId) {
        const res = await fetch("/api/resources", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error ?? "Erstellen fehlgeschlagen");
      } else {
        const res = await fetch(`/api/resources/${selectedId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error ?? "Bearbeiten fehlgeschlagen");
      }

      resetForm();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unbekannter Fehler");
    } finally {
      setLoading(false);
    }
  }

  async function onDelete(id: string) {
    const ok = window.confirm("Ressource löschen?");
    if (!ok) return;

    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/resources/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Löschen fehlgeschlagen");
      if (selectedId === id) resetForm();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unbekannter Fehler");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold">Ressourcen</h1>
        <p className="text-sm text-gray-700">Links und Material für das Teamprojekt.</p>
      </div>

      {isHiwi ? (
        <div className="rounded border bg-white p-4">
          <h2 className="font-semibold">{selectedId ? "Ressource bearbeiten" : "Neue Ressource"}</h2>
          <form className="mt-4 space-y-3" onSubmit={onSubmit}>
            <div className="space-y-1">
              <label className="text-sm text-gray-700">Titel</label>
              <input
                className="w-full rounded border px-3 py-2 text-sm"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-700">URL</label>
              <input
                className="w-full rounded border px-3 py-2 text-sm"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-700">Kategorie (optional)</label>
              <input
                className="w-full rounded border px-3 py-2 text-sm"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="z.B. Vorlagen / Wiki / Tools"
              />
            </div>
            {error ? <div className="text-sm text-red-600">{error}</div> : null}
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={loading}
                className="rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {selectedId ? "Speichern" : "Erstellen"}
              </button>
              {selectedId ? (
                <button
                  type="button"
                  disabled={loading}
                  onClick={resetForm}
                  className="rounded border px-3 py-2 text-sm font-medium disabled:opacity-50"
                >
                  Abbrechen
                </button>
              ) : null}
            </div>
          </form>
        </div>
      ) : null}

      <div className="rounded border bg-white p-4">
        <h2 className="font-semibold">Liste</h2>

        {loading ? <div className="mt-3 text-sm text-gray-700">Lade...</div> : null}
        {empty ? <div className="mt-3 text-sm text-gray-700">Noch keine Ressourcen.</div> : null}

        <div className="mt-4 space-y-3">
          {resources.map((r) => (
            <div key={r.id} className="rounded border p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{r.title}</div>
                  {r.category ? <div className="mt-1 text-sm text-gray-700">{r.category}</div> : null}
                  <a className="mt-2 inline-block text-sm underline" href={r.url} target="_blank" rel="noreferrer">
                    Öffnen
                  </a>
                </div>
                {isHiwi ? (
                  <div className="flex flex-col gap-2">
                    <button type="button" className="rounded border px-3 py-1 text-xs font-medium" onClick={() => startEdit(r)}>
                      Bearbeiten
                    </button>
                    <button
                      type="button"
                      className="rounded border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700"
                      onClick={() => onDelete(r.id)}
                    >
                      Löschen
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

