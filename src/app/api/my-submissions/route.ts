import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { prisma, getPrismaWithD1 } from "@/lib/prisma";
import { getCurrentRole } from "@/lib/authz";
import { authOptions } from "@/lib/auth";
import { getCfEnv } from "@/lib/uploads";
import type { AppRole } from "@/types/next-auth";

function requireStudent(role: AppRole | null) {
  return role === "STUDENT";
}

function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

async function getDb() {
  const env = await getCfEnv();
  if (env?.DB) return getPrismaWithD1(env.DB);
  return prisma;
}

export async function GET() {
  const role = await getCurrentRole();
  if (!requireStudent(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const db = await getDb();
  const membership = await db.teamMember.findFirst({
    where: { userId },
    select: { teamId: true },
  });
  if (!membership) return NextResponse.json({ submissions: [] });

  const submissions = await db.submission.findMany({
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

  const db = await getDb();
  const membership = await db.teamMember.findFirst({
    where: { userId },
    select: { teamId: true },
  });
  if (!membership) {
    return NextResponse.json({ error: "Du bist keinem Team zugeordnet." }, { status: 400 });
  }

  const teamId = membership.teamId;
  const bytes = Buffer.from(await file.arrayBuffer());
  const filename = `${Date.now()}-${safeFileName(file.name) || "upload"}`;
  
  const env = await getCfEnv();
  let fileUrl = "";

  if (env?.PDF_BUCKET) {
    // Cloudflare R2
    const r2Key = `submissions/${teamId}/${filename}`;
    await (env.PDF_BUCKET as any).put(r2Key, bytes, { httpMetadata: { contentType: file.type || "application/octet-stream" } });
    fileUrl = `/api/student/submission-file/${teamId}/${filename}`; // We'll need a serving route for this
  } else {
    // Local dev
    const path = await import("path");
    const fs = await import("fs");
    const uploadsRoot = path.join(process.cwd(), "public", "uploads", teamId);
    fs.mkdirSync(uploadsRoot, { recursive: true });
    const filePath = path.join(uploadsRoot, filename);
    fs.writeFileSync(filePath, bytes);
    fileUrl = `/uploads/${teamId}/${filename}`;
  }

  const submission = await db.submission.create({
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
