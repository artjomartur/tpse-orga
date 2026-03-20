"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";

type ScheduleDto = {
  id: string;
  title: string;
  type: string;
  date: string;
};

function toDateTimeLocalValue(date: string) {
  // datetime-local expects `YYYY-MM-DDTHH:mm`
  return new Date(date).toISOString().slice(0, 16);
}

export default function SchedulePage() {
  const { data: session } = useSession();
  const role = session?.user?.role as string | undefined;
  const isHiwi = role === "HIWI" || role === "ADMIN";

  const [items, setItems] = useState<ScheduleDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [dateValue, setDateValue] = useState("");

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/schedule");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Fehler beim Laden");
      setItems((data.schedule ?? []) as ScheduleDto[]);
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
    setType("");
    setDateValue("");
  }

  function startEdit(i: ScheduleDto) {
    setSelectedId(i.id);
    setTitle(i.title);
    setType(i.type);
    setDateValue(toDateTimeLocalValue(i.date));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        title,
        type,
        date: dateValue ? new Date(dateValue).toISOString() : null,
      };

      if (!selectedId) {
        const res = await fetch("/api/schedule", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error ?? "Erstellen fehlgeschlagen");
      } else {
        const res = await fetch(`/api/schedule/${selectedId}`, {
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
    const ok = window.confirm("Termin löschen?");
    if (!ok) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/schedule/${id}`, { method: "DELETE" });
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

  const empty = useMemo(() => !loading && items.length === 0, [loading, items]);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold">Termine</h1>
        <p className="text-sm text-gray-700">Meilensteine, Präsentationen, Abgabetermine.</p>
      </div>

      {isHiwi ? (
        <div className="rounded border bg-white p-4">
          <h2 className="font-semibold">{selectedId ? "Termin bearbeiten" : "Neuer Termin"}</h2>
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

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm text-gray-700">Typ</label>
                <input
                  className="w-full rounded border px-3 py-2 text-sm"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  required
                  placeholder="z.B. Meilenstein / Abgabe / Präsentation"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm text-gray-700">Datum/Zeit</label>
                <input
                  type="datetime-local"
                  className="w-full rounded border px-3 py-2 text-sm"
                  value={dateValue}
                  onChange={(e) => setDateValue(e.target.value)}
                  required
                />
              </div>
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
        <h2 className="font-semibold">Übersicht</h2>

        {loading ? <div className="mt-3 text-sm text-gray-700">Lade...</div> : null}
        {empty ? <div className="mt-3 text-sm text-gray-700">Noch keine Termine.</div> : null}

        <div className="mt-4 space-y-3">
          {items.map((i) => (
            <div key={i.id} className="rounded border p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{i.title}</div>
                  <div className="mt-1 text-sm text-gray-700">{i.type}</div>
                  <div className="mt-2 text-xs text-gray-500">
                    {new Date(i.date).toLocaleString()}
                  </div>
                </div>

                {isHiwi ? (
                  <div className="flex flex-col gap-2">
                    <button type="button" className="rounded border px-3 py-1 text-xs font-medium" onClick={() => startEdit(i)}>
                      Bearbeiten
                    </button>
                    <button
                      type="button"
                      className="rounded border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700"
                      onClick={() => onDelete(i.id)}
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

