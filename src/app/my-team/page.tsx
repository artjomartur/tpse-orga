import { getServerSession } from "next-auth/next";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function MyTeamPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return (
      <div className="space-y-2">
        <h1 className="text-xl font-bold">Mein Team</h1>
        <p className="text-sm text-gray-700">Bitte einloggen.</p>
      </div>
    );
  }

  const membership = await prisma.teamMember.findFirst({
    where: { userId },
    include: { team: true },
  });

  if (!membership) {
    return (
      <div className="space-y-2">
        <h1 className="text-xl font-bold">Mein Team</h1>
        <p className="text-sm text-gray-700">Aktuell bist du keinem Team zugeordnet.</p>
      </div>
    );
  }

  const members = await prisma.teamMember.findMany({
    where: { teamId: membership.teamId },
    include: { user: { select: { email: true, name: true, role: true } } },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Mein Team</h1>

      <div className="rounded border bg-white p-4">
        <div className="text-sm text-gray-500">Team</div>
        <div className="mt-1 font-semibold">{membership.team.name}</div>
        {membership.team.projectName ? (
          <div className="mt-1 text-sm text-gray-700">Projekt: {membership.team.projectName}</div>
        ) : null}
        <div className="mt-2 text-sm text-gray-700">
          Mitglieder: {members.length} / {membership.team.maxMembers}
        </div>
      </div>

      <div className="rounded border bg-white p-4">
        <div className="text-sm font-semibold">Mitglieder</div>
        <ul className="mt-2 space-y-2 text-sm">
          {members.map((m) => (
            <li key={m.id} className="flex items-center justify-between gap-3">
              <span>
                {m.user.name ?? m.user.email} <span className="text-gray-500">({m.user.email})</span>
              </span>
              <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700">{m.user.role}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

