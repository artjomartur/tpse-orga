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
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Aktivitäten Loggen</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">Übersicht deiner geleisteten Stunden und Tätigkeiten.</p>
      </div>

      <form onSubmit={handleCreate} className="rounded-2xl border border-slate-200/60 bg-white/50 backdrop-blur-sm p-6 shadow-sm dark:bg-slate-900/50 dark:border-slate-800/60 space-y-5">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-200">Neue Aktivität eintragen</h2>
        <div>
          <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">Titel / Kategorie</label>
          <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-xl border border-slate-200/60 p-2.5 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-slate-900/50 dark:border-slate-800/60 dark:text-slate-100" placeholder="z.B. Korrektur Abgabe 1" />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">Beschreibung (optional)</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-xl border border-slate-200/60 p-2.5 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-slate-900/50 dark:border-slate-800/60 dark:text-slate-100" placeholder="Notizen..." />
          </div>
          <div className="w-1/3">
            <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">Dauer (Minuten)</label>
            <input required type="number" min="1" value={minutes} onChange={(e) => setMinutes(e.target.value)} className="w-full rounded-xl border border-slate-200/60 p-2.5 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-slate-900/50 dark:border-slate-800/60 dark:text-slate-100" placeholder="z.B. 120" />
          </div>
        </div>
        <button type="submit" className="w-full sm:w-auto rounded-xl bg-green-600 px-6 py-2.5 font-medium text-white shadow-sm transition-colors hover:bg-green-700">Aktivität speichern</button>
      </form>

      <div className="space-y-4">
        {activities.map((act) => (
          <div key={act.id} className="group p-5 rounded-2xl border border-slate-200/60 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-slate-900/50 dark:border-slate-800/60 flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">{act.title}</h3>
              {act.description && <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{act.description}</p>}
            </div>
            <div className="text-right flex flex-col items-end">
              <span className="inline-flex rounded-full bg-blue-100 dark:bg-blue-900/50 px-3 py-1 text-xs font-semibold text-blue-800 dark:text-blue-300">
                {act.minutes} Min.
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-2 font-medium">{new Date(act.date).toLocaleDateString("de-DE")}</p>
            </div>
          </div>
        ))}
        {activities.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">Keine Aktivitäten aufgezeichnet.</p>}
      </div>
    </div>
  );
}
