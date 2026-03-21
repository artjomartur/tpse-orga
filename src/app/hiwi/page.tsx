import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HiwiDashboardPage() {
  const ungradedSubmissions = await prisma.submission.count({
    where: { grade: null },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Hiwi Dashboard</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">Übersicht und Schnellzugriff für Lehrassistenten.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        <div className="group flex flex-col p-6 rounded-2xl border border-slate-200/60 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-slate-800/60 dark:bg-slate-900/50">
          <h2 className="font-semibold text-lg mb-2 text-slate-900 dark:text-slate-100">Offene Bewertungen</h2>
          <p className="text-4xl font-bold tracking-tight text-orange-600 dark:text-orange-400 mb-6 flex-1">
            {ungradedSubmissions}
          </p>
          <Link href="/hiwi/grading" className="inline-flex items-center text-sm font-medium text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300">
            Zum Assessment Portal <span className="ml-1 transition-transform group-hover:translate-x-1">&rarr;</span>
          </Link>
        </div>

        <div className="group flex flex-col p-6 rounded-2xl border border-slate-200/60 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-slate-800/60 dark:bg-slate-900/50">
          <h2 className="font-semibold text-lg mb-2 text-slate-900 dark:text-slate-100">Spezifikationen</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 flex-1">
            PDFs der Teams einsehen, markieren und kommentieren.
          </p>
          <Link href="/hiwi/specs" className="inline-flex items-center text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">
            PDFs öffnen <span className="ml-1 transition-transform group-hover:translate-x-1">&rarr;</span>
          </Link>
        </div>

        <div className="group flex flex-col p-6 rounded-2xl border border-slate-200/60 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-slate-800/60 dark:bg-slate-900/50">
          <h2 className="font-semibold text-lg mb-2 text-slate-900 dark:text-slate-100">Meine ToDos</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 flex-1">
            Behalte den Überblick über deine Aufgaben als Hiwi.
          </p>
          <Link href="/hiwi/todos" className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
            ToDos ansehen <span className="ml-1 transition-transform group-hover:translate-x-1">&rarr;</span>
          </Link>
        </div>

        <div className="group flex flex-col p-6 rounded-2xl border border-slate-200/60 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-slate-800/60 dark:bg-slate-900/50">
          <h2 className="font-semibold text-lg mb-2 text-slate-900 dark:text-slate-100">Aktivitäten</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 flex-1">
            Tracke deine Arbeitsstunden und Tätigkeiten.
          </p>
          <Link href="/hiwi/activities" className="inline-flex items-center text-sm font-medium text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300">
            Zu den Aktivitäten <span className="ml-1 transition-transform group-hover:translate-x-1">&rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
