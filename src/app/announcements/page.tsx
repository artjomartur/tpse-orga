"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";

type AnnouncementDto = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
};

export default function AnnouncementsPage() {
  const { data: session } = useSession();
  const role = session?.user?.role as string | undefined;
  const isHiwi = role === "HIWI" || role === "ADMIN";

  const [announcements, setAnnouncements] = useState<AnnouncementDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/announcements");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Fehler beim Laden");
      setAnnouncements((data.announcements ?? []) as AnnouncementDto[]);
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
    setContent("");
  }

  function startEdit(a: AnnouncementDto) {
    setSelectedId(a.id);
    setTitle(a.title);
    setContent(a.content);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!selectedId) {
        const res = await fetch("/api/announcements", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, content }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error ?? "Erstellen fehlgeschlagen");
      } else {
        const res = await fetch(`/api/announcements/${selectedId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, content }),
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
    const ok = window.confirm("Ankündigung löschen?");
    if (!ok) return;

    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/announcements/${id}`, { method: "DELETE" });
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

  const empty = useMemo(() => !loading && announcements.length === 0, [loading, announcements]);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold">Ankündigungen</h1>
        <p className="text-sm text-gray-700">Infos für alle Teilnehmenden.</p>
      </div>

      {isHiwi ? (
        <div className="rounded border bg-white p-4">
          <h2 className="font-semibold">{selectedId ? "Ankündigung bearbeiten" : "Neue Ankündigung"}</h2>
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
              <label className="text-sm text-gray-700">Inhalt</label>
              <textarea
                className="min-h-[120px] w-full rounded border px-3 py-2 text-sm"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
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
                <button type="button" disabled={loading} onClick={resetForm} className="rounded border px-3 py-2 text-sm font-medium disabled:opacity-50">
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
        {empty ? <div className="mt-3 text-sm text-gray-700">Noch keine Ankündigungen.</div> : null}

        <div className="mt-4 space-y-3">
          {announcements.map((a) => (
            <div key={a.id} className="rounded border p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{a.title}</div>
                  <div className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{a.content}</div>
                  <div className="mt-2 text-xs text-gray-500">{new Date(a.createdAt).toLocaleString()}</div>
                </div>

                {isHiwi ? (
                  <div className="flex flex-col gap-2">
                    <button type="button" className="rounded border px-3 py-1 text-xs font-medium" onClick={() => startEdit(a)}>
                      Bearbeiten
                    </button>
                    <button
                      type="button"
                      className="rounded border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700"
                      onClick={() => onDelete(a.id)}
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

