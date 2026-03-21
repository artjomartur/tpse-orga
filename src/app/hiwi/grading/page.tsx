"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type Submission = {
  id: string;
  teamId: string;
  type: string;
  fileUrl: string | null;
  status: string;
  submittedAt: string;
  team: { id: string; name: string };
  grade?: { points: number | null; feedback: string | null; id: string } | null;
};

export default function HiwiGradingPage() {
  const { data: session } = useSession();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeSub, setActiveSub] = useState<string | null>(null);
  const [points, setPoints] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    fetch("/api/hiwi/grading")
      .then((res) => res.json())
      .then((data) => {
        setSubmissions(data.submissions || []);
        setLoading(false);
      });
  }, []);

  const handleSaveGrade = async (subId: string) => {
    await fetch("/api/hiwi/grading", {
      method: "POST",
      body: JSON.stringify({ submissionId: subId, points: Number(points), feedback }),
    });
    // refresh
    const res = await fetch("/api/hiwi/grading");
    const data = await res.json();
    setSubmissions(data.submissions || []);
    setActiveSub(null);
  };

  const openGradingPanel = (sub: Submission) => {
    setActiveSub(sub.id);
    setPoints(sub.grade?.points?.toString() || "");
    setFeedback(sub.grade?.feedback || "");
  };

  if (loading) return <p className="dark:text-gray-300">Lade Abgaben...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Bewertungsplattform</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">Übersicht aller Abgaben und Feedbacks.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm dark:bg-slate-900/50 dark:border-slate-800/60">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200/60 dark:divide-slate-800/60">
            <thead className="bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-sm">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Team</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Typ</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Datum</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Punkte</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Aktion</th>
            </tr>
          </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 bg-white/50 dark:bg-transparent">
            {submissions.map((sub) => (
              <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900 dark:text-slate-100">{sub.team?.name || "Unbekannt"}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{sub.type}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{new Date(sub.submittedAt).toLocaleDateString("de-DE")}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  {sub.grade ? (
                    <span className="inline-flex rounded-full bg-green-100 dark:bg-green-900/40 px-2 text-xs font-semibold leading-5 text-green-800 dark:text-green-300">
                      {sub.grade.points !== null ? sub.grade.points : "-"} Pkt.
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full bg-yellow-100 dark:bg-yellow-900/40 px-2 text-xs font-semibold leading-5 text-yellow-800 dark:text-yellow-300">
                      Ausstehend
                    </span>
                  )}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                  {activeSub === sub.id ? (
                    <div className="flex flex-col gap-2 min-w-[250px]">
                      <input 
                        type="number" 
                        placeholder="Punkte" 
                        value={points} 
                        onChange={(e) => setPoints(e.target.value)} 
                        className="rounded border p-1 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                      />
                      <textarea 
                        placeholder="Feedback..." 
                        value={feedback} 
                        onChange={(e) => setFeedback(e.target.value)}
                        className="rounded border p-1 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                      />
                      <div className="flex gap-2 mt-1">
                        <button onClick={() => handleSaveGrade(sub.id)} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-700 shadow-sm transition-colors">Speichern</button>
                        <button onClick={() => setActiveSub(null)} className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Abbrechen</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => openGradingPanel(sub)} className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                      {sub.grade ? "Bearbeiten" : "Bewerten"}
                    </button>
                  )}
                  {sub.fileUrl && !activeSub && (
                    <a href={sub.fileUrl} target="_blank" rel="noreferrer" className="ml-4 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium">
                      Datei ansehen
                    </a>
                  )}
                </td>
              </tr>
            ))}
            {submissions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500 dark:text-slate-400">Keine Abgaben gefunden.</td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
