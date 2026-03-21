import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/lib/auth";
import { getCurrentRole } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import type { AppRole } from "@/types/next-auth";

function requireStudent(role: AppRole | null) {
  return role === "STUDENT";
}

export async function GET() {
  const role = await getCurrentRole();
  if (!requireStudent(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const myMembership = await prisma.teamMember.findFirst({ where: { userId } });
  if (myMembership) {
    return NextResponse.json({ teams: [] });
  }

  const teams = await prisma.team.findMany({
    include: {
      members: {
        include: { user: { select: { email: true, name: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const availableTeams = teams
    .filter((t) => t.members.length < t.maxMembers && t.members.length < 5)
    .map((t) => ({
      id: t.id,
      name: t.name,
      maxMembers: t.maxMembers,
      memberCount: t.members.length,
      members: t.members.map((m) => ({
        id: m.id,
        name: m.user.name,
        email: m.user.email,
      })),
    }));

  return NextResponse.json({ teams: availableTeams });
}

