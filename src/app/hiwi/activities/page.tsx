"use client";

import { useEffect, useState } from "react";

type Activity = { id: string; title: string; description: string | null; minutes: number; date: string };

export default function HiwiActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [minutes, setMinutes] = useState("");

  const loadActivities = () => {
    fetch("/api/hiwi/activities")
      .then((res) => res.json())
      .then((data) => setActivities(data.activities || []));
  };

  useEffect(() => {
    loadActivities();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await fetch("/api/hiwi/activities", {
      method: "POST",
      body: JSON.stringify({ title, description, minutes: Number(minutes) }),
    });
    setTitle("");
    setDescription("");
    setMinutes("");
    loadActivities();
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold dark:text-gray-100">Aktivitäten Loggen</h1>
      <p className="text-gray-600 dark:text-gray-400">Übersicht deiner geleisteten Stunden und Tätigkeiten.</p>

      <form onSubmit={handleCreate} className="bg-gray-50 dark:bg-gray-900 border dark:border-gray-800 p-4 rounded-lg space-y-4">
        <h2 className="font-semibold dark:text-gray-200">Neue Aktivität eintragen</h2>
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-300">Titel / Kategorie</label>
          <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border p-2 rounded dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" placeholder="z.B. Korrektur Abgabe 1" />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Beschreibung (optional)</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border p-2 rounded dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" placeholder="Notizen..." />
          </div>
          <div className="w-1/3">
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Dauer (Minuten)</label>
            <input required type="number" min="1" value={minutes} onChange={(e) => setMinutes(e.target.value)} className="w-full border p-2 rounded dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" placeholder="z.B. 120" />
          </div>
        </div>
        <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors">Aktivität speichern</button>
      </form>

      <div className="space-y-3">
        {activities.map((act) => (
          <div key={act.id} className="p-3 border rounded border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{act.title}</h3>
              {act.description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{act.description}</p>}
            </div>
            <div className="text-right">
              <span className="inline-flex rounded-full bg-blue-100 dark:bg-blue-900/50 px-2 py-1 text-xs font-semibold text-blue-800 dark:text-blue-300">
                {act.minutes} Min.
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{new Date(act.date).toLocaleDateString("de-DE")}</p>
            </div>
          </div>
        ))}
        {activities.length === 0 && <p className="text-sm text-gray-500">Keine Aktivitäten aufgezeichnet.</p>}
      </div>
    </div>
  );
}
