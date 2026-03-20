import { getServerSession } from "next-auth/next";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role ?? "UNKNOWN";

  const now = new Date();
  const [teamCount, submissionCount, gradeCount, openSubmissionCount, nextSchedule, latestAnnouncements] = await Promise.all([
    prisma.team.count(),
    prisma.submission.count(),
    prisma.grade.count(),
    prisma.submission.count({
      where: {
        grade: null,
      },
    }),
    prisma.scheduleItem.findFirst({
      where: { date: { gte: now } },
      orderBy: { date: "asc" },
    }),
    prisma.announcement.findMany({
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Dashboard</h1>
      <div className="rounded border bg-white p-4 text-sm text-gray-700">
        Angemeldet als <span className="font-medium text-gray-900">{session?.user?.email}</span> (Rolle:{" "}
        <span className="font-medium text-gray-900">{role}</span>)
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded border bg-white p-4">
          <div className="text-xs text-gray-500">Nächster Termin</div>
          <div className="mt-1 font-semibold">
            {nextSchedule ? new Date(nextSchedule.date).toLocaleString() : "—"}
          </div>
          {nextSchedule ? (
            <div className="mt-1 text-sm text-gray-700">{nextSchedule.title}</div>
          ) : null}
        </div>
        <div className="rounded border bg-white p-4">
          <div className="text-xs text-gray-500">Offene Abgaben</div>
          <div className="mt-1 font-semibold">{openSubmissionCount}</div>
        </div>
        <div className="rounded border bg-white p-4">
          <div className="text-xs text-gray-500">Aktive Teams</div>
          <div className="mt-1 font-semibold">{teamCount}</div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded border bg-white p-4">
          <h2 className="font-semibold">Abgaben-Status</h2>
          <div className="mt-3 space-y-2 text-sm text-gray-700">
            <div className="flex items-center justify-between gap-3">
              <span className="text-gray-500">Gesamt</span>
              <span className="font-medium">{submissionCount}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-gray-500">Bewertet</span>
              <span className="font-medium">{gradeCount}</span>
            </div>
          </div>
        </div>

        <div className="rounded border bg-white p-4">
          <h2 className="font-semibold">Letzte Ankündigungen</h2>
          <div className="mt-3 space-y-3">
            {latestAnnouncements.length === 0 ? (
              <div className="text-sm text-gray-700">Noch keine Ankündigungen.</div>
            ) : (
              latestAnnouncements.map((a) => (
                <div key={a.id} className="rounded border p-3">
                  <div className="font-medium">{a.title}</div>
                  <div className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{a.content}</div>
                  <div className="mt-2 text-xs text-gray-500">{new Date(a.createdAt).toLocaleString()}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

