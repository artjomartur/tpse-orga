import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getCurrentRole } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const role = await getCurrentRole();
  // Students and Hiwis can both read assignments
  if (!role) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const assignments = await prisma.studentAssignment.findMany({
    orderBy: { deadline: "asc" },
    include: { createdBy: { select: { name: true, email: true } } },
  });

  return NextResponse.json({ assignments });
}

export async function POST(req: Request) {
  const role = await getCurrentRole();
  if (role !== "HIWI" && role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const { title, description, submissionType, deadline } = body || {};

  if (!title?.trim()) return NextResponse.json({ error: "Titel fehlt." }, { status: 400 });
  if (!submissionType?.trim()) return NextResponse.json({ error: "Art der Abgabe fehlt." }, { status: 400 });

  const assignment = await prisma.studentAssignment.create({
    data: {
      title: title.trim(),
      description: description?.trim() || null,
      submissionType: submissionType.trim(),
      deadline: deadline ? new Date(deadline) : null,
      createdById: userId,
    },
  });

  return NextResponse.json({ assignment });
}
