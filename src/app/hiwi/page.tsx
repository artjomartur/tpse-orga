import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function HiwiDashboardPage() {
  const ungradedSubmissions = await prisma.submission.count({
    where: { grade: null },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold dark:text-gray-100">Hiwi Dashboard</h1>
      <p className="text-gray-600 dark:text-gray-400">Übersicht und Schnellzugriff für Lehrassistenten.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="p-4 border rounded-lg bg-orange-50 dark:bg-orange-900/20 dark:border-orange-900/30 border-orange-200 text-orange-800 dark:text-orange-200">
          <h2 className="font-semibold mb-2">Offene Bewertungen</h2>
          <p className="text-3xl font-bold mb-4">{ungradedSubmissions}</p>
          <Link href="/hiwi/grading" className="text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300 underline underline-offset-2">
            Zum Assessment Portal →
          </Link>
        </div>

        <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/20 dark:border-blue-900/30 border-blue-200 text-blue-800 dark:text-blue-200">
          <h2 className="font-semibold mb-2">Meine ToDos</h2>
          <p className="mt-2 text-sm">Behalte den Überblick über deine Aufgaben als Hiwi.</p>
          <Link href="/hiwi/todos" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline underline-offset-2 mt-4 inline-block">
            ToDos ansehen →
          </Link>
        </div>

        <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-900/20 dark:border-green-900/30 border-green-200 text-green-800 dark:text-green-200">
          <h2 className="font-semibold mb-2">Aktivitäten</h2>
          <p className="mt-2 text-sm">Tracke deine Arbeitsstunden und Tätigkeiten.</p>
          <Link href="/hiwi/activities" className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 underline underline-offset-2 mt-4 inline-block">
            Zu den Aktivitäten →
          </Link>
        </div>
      </div>
    </div>
  );
}
