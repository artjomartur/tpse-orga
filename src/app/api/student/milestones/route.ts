import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/lib/auth";
import { getCurrentRole } from "@/lib/authz";
import {
  MILESTONE_ENV,
  daysUntil,
  isOverdue,
  isUrgent,
  parseDeadlineFromEnv,
  type MilestoneKey,
} from "@/lib/milestones";
import { prisma } from "@/lib/prisma";
import type { AppRole } from "@/types/next-auth";

const KIND_FAV = "FAVORITE";
const KIND_NIE = "NIE";

function requireStudent(role: AppRole | null) {
  return role === "STUDENT";
}

type MilestoneRow = {
  key: MilestoneKey;
  title: string;
  description: string;
  deadline: string | null;
  deadlineSet: boolean;
  done: boolean;
  blocked: boolean;
  blockedReason: string | null;
  overdue: boolean;
  urgent: boolean;
  daysRemaining: number | null;
};

export async function GET() {
  const role = await getCurrentRole();
  if (!requireStudent(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const membership = await prisma.teamMember.findFirst({
    where: { userId },
    include: { team: true },
  });

  const teamId = membership?.teamId ?? null;

  let projectPrefsDone = false;
  let specDone = false;

  if (teamId) {
    const [favCount, nieCount, spec] = await Promise.all([
      prisma.teamProjectChoice.count({ where: { teamId, kind: KIND_FAV } }),
      prisma.teamProjectChoice.count({ where: { teamId, kind: KIND_NIE } }),
      prisma.teamSpecDocument.findUnique({ where: { teamId } }),
    ]);
    projectPrefsDone = favCount === 5 && nieCount === 5;
    specDone = !!spec;
  }

  const joinDone = !!membership;

  const dlJoin = parseDeadlineFromEnv(MILESTONE_ENV.JOIN);
  const dlProj = parseDeadlineFromEnv(MILESTONE_ENV.PROJECT_PREFERENCES);
  const dlSpec = parseDeadlineFromEnv(MILESTONE_ENV.SPEC);

  const rows: MilestoneRow[] = [
    {
      key: "JOIN_TEAM",
      title: "Teamzuordnung abschließen",
      description: "Einzelteam, MiniGruppe oder einem bestehenden Team beitreten.",
      deadline: dlJoin?.toISOString() ?? null,
      deadlineSet: !!dlJoin,
      done: joinDone,
      blocked: false,
      blockedReason: null,
      overdue: isOverdue(dlJoin, joinDone),
      urgent: isUrgent(dlJoin, joinDone),
      daysRemaining: daysUntil(dlJoin),
    },
    {
      key: "PROJECT_PREFERENCES",
      title: "Projektwahl (5 Favoriten + 5 Nieten)",
      description: "Alle zehn Plätze müssen mit Projekten belegt und gespeichert sein.",
      deadline: dlProj?.toISOString() ?? null,
      deadlineSet: !!dlProj,
      done: projectPrefsDone,
      blocked: !teamId,
      blockedReason: !teamId ? "Erst Team wählen – danach wird die Projektwahl freigeschaltet." : null,
      overdue: teamId ? isOverdue(dlProj, projectPrefsDone) : isOverdue(dlProj, false),
      urgent: teamId ? isUrgent(dlProj, projectPrefsDone) : isUrgent(dlProj, false),
      daysRemaining: daysUntil(dlProj),
    },
    {
      key: "SPEC_UPLOAD",
      title: "Spezifikationsdokument (PDF) hochladen",
      description: "Eine PDF-Spezifikation pro Team; Text wird automatisch angezeigt.",
      deadline: dlSpec?.toISOString() ?? null,
      deadlineSet: !!dlSpec,
      done: specDone,
      blocked: !teamId,
      blockedReason: !teamId ? "Erst Team wählen – Upload ist teamgebunden." : null,
      overdue: teamId ? isOverdue(dlSpec, specDone) : isOverdue(dlSpec, false),
      urgent: teamId ? isUrgent(dlSpec, specDone) : isUrgent(dlSpec, false),
      daysRemaining: daysUntil(dlSpec),
    },
  ];

  const openCount = rows.filter((r) => !r.done).length;
  const overdueCount = rows.filter((r) => !r.done && r.overdue).length;

  return NextResponse.json({
    milestones: rows,
    teamId,
    summary: { openCount, overdueCount },
  });
}
