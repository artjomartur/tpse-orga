import { getServerSession } from "next-auth/next";
import Link from "next/link";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role ?? "UNKNOWN";
  const isHiwi = role === "HIWI" || role === "ADMIN";

  const now = new Date();
  const [teamCount, submissionCount, gradeCount, openSubmissionCount, nextSchedule, latestAnnouncements] = await Promise.all([
    prisma.team.count(),
    prisma.submission.count(),
    prisma.grade.count(),
    prisma.submission.count({ where: { grade: null } }),
    prisma.scheduleItem.findFirst({ where: { date: { gte: now } }, orderBy: { date: "asc" } }),
    prisma.announcement.findMany({ orderBy: { createdAt: "desc" }, take: 3 }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold dark:text-slate-100">Dashboard</h1>
      <div className="rounded-2xl border border-slate-200/60 bg-white/50 backdrop-blur-md p-6 text-sm text-gray-700 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/50 dark:text-slate-400">
        Angemeldet als <span className="font-medium text-gray-900 dark:text-slate-100">{session?.user?.email}</span> (Rolle:{" "}
        <span className="font-medium text-gray-900 dark:text-slate-100">{role}</span>)
      </div>

      {/* Hiwi Schnellzugriff */}
      {isHiwi && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Hiwi Schnellzugriff</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/hiwi/grading" className="group flex flex-col p-5 rounded-2xl border border-slate-200/60 bg-white/50 backdrop-blur-md shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800/60 dark:bg-slate-900/50">
              <span className="text-2xl mb-2">📋</span>
              <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">Bewertungen</span>
              <span className="text-xs text-orange-600 dark:text-orange-400 mt-1">{openSubmissionCount} offen</span>
            </Link>
            <Link href="/hiwi/specs" className="group flex flex-col p-5 rounded-2xl border border-slate-200/60 bg-white/50 backdrop-blur-md shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800/60 dark:bg-slate-900/50">
              <span className="text-2xl mb-2">📄</span>
              <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">Spezifikationen</span>
              <span className="text-xs text-purple-600 dark:text-purple-400 mt-1">PDFs & Annotationen</span>
            </Link>
            <Link href="/hiwi/assignments" className="group flex flex-col p-5 rounded-2xl border border-slate-200/60 bg-white/50 backdrop-blur-md shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800/60 dark:bg-slate-900/50">
              <span className="text-2xl mb-2">📝</span>
              <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">Aufgaben</span>
              <span className="text-xs text-blue-600 dark:text-blue-400 mt-1">Für Studierende erstellen</span>
            </Link>
            <Link href="/hiwi/activities" className="group flex flex-col p-5 rounded-2xl border border-slate-200/60 bg-white/50 backdrop-blur-md shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800/60 dark:bg-slate-900/50">
              <span className="text-2xl mb-2">⏱️</span>
              <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">Aktivitäten</span>
              <span className="text-xs text-green-600 dark:text-green-400 mt-1">Stunden tracken</span>
            </Link>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/60 bg-white/50 backdrop-blur-md p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/50">
          <div className="text-xs text-gray-500 dark:text-slate-400">Nächster Termin</div>
          <div className="mt-1 font-semibold dark:text-slate-100">
            {nextSchedule ? new Date(nextSchedule.date).toLocaleString() : "—"}
          </div>
          {nextSchedule ? (
            <div className="mt-1 text-sm text-gray-700 dark:text-slate-300">{nextSchedule.title}</div>
          ) : null}
        </div>
        <div className="rounded-2xl border border-slate-200/60 bg-white/50 backdrop-blur-md p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/50">
          <div className="text-xs text-gray-500 dark:text-slate-400">Offene Abgaben</div>
          <div className="mt-1 font-semibold dark:text-slate-100">{openSubmissionCount}</div>
        </div>
        <div className="rounded-2xl border border-slate-200/60 bg-white/50 backdrop-blur-md p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/50">
          <div className="text-xs text-gray-500 dark:text-slate-400">Aktive Teams</div>
          <div className="mt-1 font-semibold dark:text-slate-100">{teamCount}</div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200/60 bg-white/50 backdrop-blur-md p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/50">
          <h2 className="font-semibold dark:text-slate-100">Abgaben-Status</h2>
          <div className="mt-3 space-y-2 text-sm text-gray-700 dark:text-slate-400">
            <div className="flex items-center justify-between gap-3">
              <span className="text-gray-500 dark:text-slate-500">Gesamt</span>
              <span className="font-medium dark:text-slate-100">{submissionCount}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-gray-500 dark:text-slate-500">Bewertet</span>
              <span className="font-medium dark:text-slate-100">{gradeCount}</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/60 bg-white/50 backdrop-blur-md p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/50">
          <h2 className="font-semibold dark:text-slate-100">Letzte Ankündigungen</h2>
          <div className="mt-3 space-y-3">
            {latestAnnouncements.length === 0 ? (
              <div className="text-sm text-gray-700 dark:text-slate-400">Noch keine Ankündigungen.</div>
            ) : (
              latestAnnouncements.map((a) => (
                <div key={a.id} className="rounded border border-slate-200 p-3 dark:border-slate-700 dark:bg-slate-800/50">
                  <div className="font-medium dark:text-slate-100">{a.title}</div>
                  <div className="mt-1 whitespace-pre-wrap text-sm text-gray-700 dark:text-slate-300">{a.content}</div>
                  <div className="mt-2 text-xs text-gray-500 dark:text-slate-400">{new Date(a.createdAt).toLocaleString()}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
