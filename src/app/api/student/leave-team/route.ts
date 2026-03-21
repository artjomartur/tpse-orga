import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/lib/auth";
import { getCurrentRole } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import type { AppRole } from "@/types/next-auth";

function requireStudent(role: AppRole | null) {
  return role === "STUDENT";
}

export async function POST() {
  const role = await getCurrentRole();
  if (!requireStudent(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const membership = await prisma.teamMember.findFirst({
    where: { userId },
    include: { team: { include: { members: true } } },
  });
  if (!membership) {
    return NextResponse.json({ error: "Du bist in keinem Team." }, { status: 400 });
  }

  await prisma.teamMember.delete({ where: { id: membership.id } });

  const remaining = await prisma.teamMember.count({ where: { teamId: membership.teamId } });
  if (remaining === 0) {
    await prisma.team.delete({ where: { id: membership.teamId } });
  }

  return NextResponse.json({ ok: true });
}
