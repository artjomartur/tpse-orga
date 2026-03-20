import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentRole } from "@/lib/authz";
import type { AppRole } from "@/types/next-auth";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

function requireHiwi(role: AppRole | null) {
  return role === "HIWI" || role === "ADMIN";
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const role = await getCurrentRole();
  if (!requireHiwi(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const session = await getServerSession(authOptions);
  const gradedById = session?.user?.id;
  if (!gradedById) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const pointsRaw = body?.points;
  const feedback = body?.feedback ? String(body.feedback) : null;

  const points =
    pointsRaw === undefined || pointsRaw === null || pointsRaw === ""
      ? null
      : Number(pointsRaw);

  if (points !== null && !Number.isFinite(points)) {
    return NextResponse.json({ error: "Ungültige Punkte." }, { status: 400 });
  }

  // Upsert grade for this submission.
  const grade = await prisma.grade.upsert({
    where: { submissionId: params.id },
    create: {
      submissionId: params.id,
      points,
      feedback,
      gradedById,
    },
    update: {
      points,
      feedback,
      gradedById,
    },
  });

  return NextResponse.json({ grade });
}

