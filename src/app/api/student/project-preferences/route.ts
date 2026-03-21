import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/lib/auth";
import { getCurrentRole } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { getStudentTeamMembership } from "@/lib/student-team";
import type { AppRole } from "@/types/next-auth";

const KIND_FAV = "FAVORITE";
const KIND_NIE = "NIE";

function requireStudent(role: AppRole | null) {
  return role === "STUDENT";
}

function normalizeSlots(arr: unknown): (string | null)[] | null {
  if (!Array.isArray(arr) || arr.length !== 5) return null;
  const out: (string | null)[] = [];
  for (const x of arr) {
    if (x === null || x === undefined) {
      out.push(null);
      continue;
    }
    if (typeof x === "string" && x.trim()) {
      out.push(x.trim());
      continue;
    }
    return null;
  }
  return out;
}

export async function GET() {
  const role = await getCurrentRole();
  if (!requireStudent(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const projects = await prisma.project.findMany({
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });

  const membership = await getStudentTeamMembership(userId);
  if (!membership) {
    return NextResponse.json({ projects, team: null, favorites: null, nies: null });
  }

  const choices = await prisma.teamProjectChoice.findMany({
    where: { teamId: membership.teamId },
    include: { project: true },
  });

  const favorites: (typeof projects[number] | null)[] = [null, null, null, null, null];
  const nies: (typeof projects[number] | null)[] = [null, null, null, null, null];

  for (const c of choices) {
    const idx = c.slot - 1;
    if (idx < 0 || idx > 4) continue;
    if (c.kind === KIND_FAV) favorites[idx] = c.project;
    if (c.kind === KIND_NIE) nies[idx] = c.project;
  }

  return NextResponse.json({
    projects,
    team: { id: membership.team.id, name: membership.team.name },
    favorites,
    nies,
  });
}

export async function PUT(req: Request) {
  const role = await getCurrentRole();
  if (!requireStudent(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const membership = await getStudentTeamMembership(userId);
  if (!membership) {
    return NextResponse.json({ error: "Du bist in keinem Team — Projektwahl ist erst nach der Gruppenwahl möglich." }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const favorites = normalizeSlots(body?.favorites);
  const nies = normalizeSlots(body?.nies);
  if (!favorites || !nies) {
    return NextResponse.json({ error: "favorites und nies müssen jeweils Arrays der Länge 5 sein (Einträge: Projekt-ID oder null)." }, { status: 400 });
  }

  const allIds = [...favorites, ...nies].filter((x): x is string => !!x);
  const unique = new Set(allIds);
  if (unique.size !== allIds.length) {
    return NextResponse.json({ error: "Jedes Projekt darf nur einmal vorkommen (keine doppelten Plätze)." }, { status: 400 });
  }

  const favSet = new Set(favorites.filter((x): x is string => !!x));
  const nieSet = new Set(nies.filter((x): x is string => !!x));
  for (const id of favSet) {
    if (nieSet.has(id)) {
      return NextResponse.json({ error: "Ein Projekt kann nicht gleichzeitig Favorit und Niete sein." }, { status: 400 });
    }
  }

  const projectRows = await prisma.project.findMany({ where: { id: { in: allIds } } });
  if (projectRows.length !== allIds.length) {
    return NextResponse.json({ error: "Unbekannte Projekt-ID in der Auswahl." }, { status: 400 });
  }

  const teamId = membership.teamId;

  await prisma.$transaction(async (tx) => {
    await tx.teamProjectChoice.deleteMany({ where: { teamId } });

    for (let i = 0; i < 5; i++) {
      const pid = favorites[i];
      if (pid) {
        await tx.teamProjectChoice.create({
          data: { teamId, projectId: pid, kind: KIND_FAV, slot: i + 1 },
        });
      }
    }
    for (let i = 0; i < 5; i++) {
      const pid = nies[i];
      if (pid) {
        await tx.teamProjectChoice.create({
          data: { teamId, projectId: pid, kind: KIND_NIE, slot: i + 1 },
        });
      }
    }
  });

  const projects = await prisma.project.findMany({
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });
  const choices = await prisma.teamProjectChoice.findMany({
    where: { teamId },
    include: { project: true },
  });

  const favOut: (typeof projects[number] | null)[] = [null, null, null, null, null];
  const nieOut: (typeof projects[number] | null)[] = [null, null, null, null, null];
  for (const c of choices) {
    const idx = c.slot - 1;
    if (idx < 0 || idx > 4) continue;
    if (c.kind === KIND_FAV) favOut[idx] = c.project;
    if (c.kind === KIND_NIE) nieOut[idx] = c.project;
  }

  return NextResponse.json({
    ok: true,
    projects,
    team: { id: membership.team.id, name: membership.team.name },
    favorites: favOut,
    nies: nieOut,
  });
}
