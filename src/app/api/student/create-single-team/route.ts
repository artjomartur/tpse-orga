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

  const existing = await prisma.teamMember.findFirst({ where: { userId } });
  if (existing) return NextResponse.json({ error: "Du bist bereits in einem Team." }, { status: 409 });

  const team = await prisma.team.create({
    data: {
      name: `Einzelteam-${new Date().toISOString().slice(0, 10)}-${userId.slice(-4)}`,
      maxMembers: 1,
      members: {
        create: [{ userId }],
      },
    },
  });

  return NextResponse.json({ team });
}

