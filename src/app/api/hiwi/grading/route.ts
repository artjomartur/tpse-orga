import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/lib/auth";
import { getCurrentRole } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import type { AppRole } from "@/types/next-auth";

function requireHiwiOrAdmin(role: AppRole | null) {
  return role === "HIWI" || role === "ADMIN";
}

export async function GET() {
  const role = await getCurrentRole();
  if (!requireHiwiOrAdmin(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Get all submissions with team info and existing grade
  const submissions = await prisma.submission.findMany({
    include: {
      team: true,
      grade: true,
    },
    orderBy: { submittedAt: "desc" },
  });

  return NextResponse.json({ submissions });
}

export async function POST(req: Request) {
  const role = await getCurrentRole();
  if (!requireHiwiOrAdmin(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const { submissionId, points, feedback } = body || {};

  if (!submissionId) return NextResponse.json({ error: "Submission ID fehlt." }, { status: 400 });

  // upsert the grade
  const grade = await prisma.grade.upsert({
    where: { submissionId },
    update: {
      points: points !== undefined ? Number(points) : null,
      feedback: feedback || null,
      gradedById: userId,
    },
    create: {
      submissionId,
      points: points !== undefined ? Number(points) : null,
      feedback: feedback || null,
      gradedById: userId,
    },
  });

  return NextResponse.json({ grade });
}
