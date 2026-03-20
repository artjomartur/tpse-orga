import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentRole } from "@/lib/authz";
import type { AppRole } from "@/types/next-auth";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/lib/auth";

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
    select: { teamId: true },
  });
  if (!membership) return NextResponse.json({ grades: [] });

  const grades = await prisma.grade.findMany({
    where: { submission: { teamId: membership.teamId } },
    orderBy: { createdAt: "desc" },
    include: {
      submission: {
        select: { id: true, type: true, fileUrl: true, status: true, submittedAt: true },
      },
    },
  });

  return NextResponse.json({ grades });
}

