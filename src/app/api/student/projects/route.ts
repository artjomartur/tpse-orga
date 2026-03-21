import { NextResponse } from "next/server";

import { getCurrentRole } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import type { AppRole } from "@/types/next-auth";

function requireStudent(role: AppRole | null) {
  return role === "STUDENT";
}

export async function GET() {
  const role = await getCurrentRole();
  if (!requireStudent(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const projects = await prisma.project.findMany({
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });

  return NextResponse.json({ projects });
}
