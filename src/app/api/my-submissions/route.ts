import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

import { getServerSession } from "next-auth/next";

import { prisma } from "@/lib/prisma";
import { getCurrentRole } from "@/lib/authz";
import { authOptions } from "@/lib/auth";
import type { AppRole } from "@/types/next-auth";

function requireStudent(role: AppRole | null) {
  return role === "STUDENT";
}

function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function GET() {
  const role = await getCurrentRole();
  if (!requireStudent(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Student identity via session -> JWT -> prisma user id
  // In next-auth v4, `getServerSession` stores user id in session.user.id.
  // Middleware protects this route already, but we still need the id for DB queries.
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const membership = await prisma.teamMember.findFirst({
    where: { userId },
    select: { teamId: true },
  });
  if (!membership) return NextResponse.json({ submissions: [] });

  const submissions = await prisma.submission.findMany({
    where: { teamId: membership.teamId },
    orderBy: { submittedAt: "desc" },
    include: {
      grade: { select: { points: true, feedback: true } },
    },
  });

  return NextResponse.json({ submissions });
}

export async function POST(req: Request) {
  const role = await getCurrentRole();
  if (!requireStudent(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const formData = await req.formData();
  const type = String(formData.get("type") ?? "").trim();
  const file = formData.get("file") as File | null;

  if (!type || !file) {
    return NextResponse.json({ error: "type und file sind erforderlich." }, { status: 400 });
  }

  const maxBytes = 10 * 1024 * 1024; // 10 MB
  if (typeof file.size === "number" && file.size > maxBytes) {
    return NextResponse.json({ error: "Datei zu groß (max. 10MB)." }, { status: 413 });
  }

  const membership = await prisma.teamMember.findFirst({
    where: { userId },
    select: { teamId: true },
  });
  if (!membership) {
    return NextResponse.json({ error: "Du bist keinem Team zugeordnet." }, { status: 400 });
  }

  const teamId = membership.teamId;

  const bytes = Buffer.from(await file.arrayBuffer());
  const filename = `${Date.now()}-${safeFileName(file.name) || "upload"}`;

  const uploadsRoot = path.join(process.cwd(), "public", "uploads", teamId);
  fs.mkdirSync(uploadsRoot, { recursive: true });
  const filePath = path.join(uploadsRoot, filename);
  fs.writeFileSync(filePath, bytes);

  const fileUrl = `/uploads/${teamId}/${filename}`;

  const submission = await prisma.submission.create({
    data: {
      teamId,
      type,
      fileUrl,
      status: "SUBMITTED",
      submittedById: userId,
    },
    include: {
      grade: { select: { points: true, feedback: true } },
    },
  });

  return NextResponse.json({ submission });
}

