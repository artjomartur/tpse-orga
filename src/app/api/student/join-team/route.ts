import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/lib/auth";
import { getCurrentRole } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import type { AppRole } from "@/types/next-auth";

function requireStudent(role: AppRole | null) {
  return role === "STUDENT";
}

export async function POST(req: Request) {
  const role = await getCurrentRole();
  if (!requireStudent(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const existingMembership = await prisma.teamMember.findFirst({ where: { userId } });
  if (existingMembership) {
    return NextResponse.json({ error: "Du bist bereits einem Team zugeordnet." }, { status: 409 });
  }

  const body = await req.json().catch(() => ({}));
  const teamId = String(body?.teamId ?? "").trim();
  if (!teamId) return NextResponse.json({ error: "teamId fehlt." }, { status: 400 });

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: { members: true },
  });
  if (!team) return NextResponse.json({ error: "Team nicht gefunden." }, { status: 404 });
  if (team.members.length >= team.maxMembers || team.members.length >= 5) {
    return NextResponse.json({ error: "Team ist voll." }, { status: 409 });
  }

  await prisma.teamMember.create({ data: { userId, teamId } });
  return NextResponse.json({ ok: true });
}

