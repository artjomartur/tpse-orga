import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentRole } from "@/lib/authz";
import type { AppRole } from "@/types/next-auth";

function requireHiwi(role: AppRole | null) {
  return role === "HIWI" || role === "ADMIN";
}

export async function GET() {
  const role = await getCurrentRole();
  if (!requireHiwi(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const submissions = await prisma.submission.findMany({
    orderBy: { submittedAt: "desc" },
    include: {
      team: { select: { id: true, name: true, project: { select: { id: true, name: true } } } },
      submittedBy: { select: { id: true, email: true, name: true, role: true } },
      grade: { select: { id: true, points: true, feedback: true, gradedById: true, createdAt: true } },
    },
  });

  return NextResponse.json({ submissions });
}

