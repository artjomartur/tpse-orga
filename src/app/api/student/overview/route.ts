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

  const membership = await prisma.teamMember.findFirst({
    where: { userId },
    include: {
      team: true,
    },
  });

  if (!membership) return NextResponse.json({ team: null, members: [] });

  const members = await prisma.teamMember.findMany({
    where: { teamId: membership.teamId },
    include: { user: { select: { id: true, email: true, name: true, role: true } } },
  });

  return NextResponse.json({ team: membership.team, members });
}

