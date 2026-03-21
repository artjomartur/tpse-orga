import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { getCloudflareContext } from "@opennextjs/cloudflare";

import { authOptions } from "@/lib/auth";
import { getCurrentRole } from "@/lib/authz";
import { prisma, getPrismaWithD1 } from "@/lib/prisma";
import { getStudentTeamMembership } from "@/lib/student-team";
import type { AppRole } from "@/types/next-auth";

const MAX_BYTES = 12 * 1024 * 1024; // 12 MB

function requireStudent(role: AppRole | null) {
  return role === "STUDENT";
}

// env bindings are fully dynamic at runtime
async function getCfEnv(): Promise<Record<string, any> | null> {
  try {
    const { env } = await getCloudflareContext();
    return (env as Record<string, any>) ?? null;
  } catch {
    return null;
  }
}

async function getDb() {
  const env = await getCfEnv();
  if (env?.DB) return getPrismaWithD1(env.DB as any);
  return prisma;
}

export async function GET() {
  const role = await getCurrentRole();
  if (!requireStudent(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const membership = await getStudentTeamMembership(userId);
  if (!membership) {
    return NextResponse.json({ spec: null, team: null });
  }

  const db = await getDb();
  const spec = await db.teamSpecDocument.findUnique({ where: { teamId: membership.teamId } });

  if (!spec) {
    return NextResponse.json({ spec: null, team: { id: membership.team.id, name: membership.team.name } });
  }

  return NextResponse.json({
    team: { id: membership.team.id, name: membership.team.name },
    spec: { fileName: spec.fileName, extractedText: spec.extractedText, uploadedAt: spec.uploadedAt.toISOString() },
  });
}

export async function POST(req: Request) {
  const role = await getCurrentRole();
  if (!requireStudent(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const membership = await getStudentTeamMembership(userId);
  if (!membership) {
    return NextResponse.json({ error: "Du bist in keinem Team." }, { status: 400 });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Keine Datei (Feld 'file') uebermittelt." }, { status: 400 });
  }

  if (file.type && file.type !== "application/pdf") {
    return NextResponse.json({ error: "Nur PDF-Dateien sind erlaubt." }, { status: 400 });
  }

  if (!file.name.toLowerCase().endsWith(".pdf")) {
    return NextResponse.json({ error: "Dateiname muss auf .pdf enden." }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.length > MAX_BYTES) {
    return NextResponse.json({ error: "PDF ist zu gross (max. ca. 12 MB)." }, { status: 400 });
  }

  const teamId = membership.teamId;
  const r2Key = `team-specs/${teamId}.pdf`;

  const env = await getCfEnv();
  let filePath = r2Key;

  if (env?.PDF_BUCKET) {
    // Cloudflare R2
    await (env.PDF_BUCKET as any).put(r2Key, buf, { httpMetadata: { contentType: "application/pdf" } });
  } else {
    // Local dev: write to filesystem
    const { writeFile } = await import("fs/promises");
    const { ensureTeamSpecsDir, teamSpecFilePath } = await import("@/lib/uploads");
    await ensureTeamSpecsDir();
    filePath = teamSpecFilePath(teamId);
    const db = await getDb();
    const existing = await db.teamSpecDocument.findUnique({ where: { teamId } });
    if (existing?.filePath && existing.filePath !== r2Key) {
      try { const { unlink } = await import("fs/promises"); await unlink(existing.filePath); } catch { /* ignore */ }
    }
    await writeFile(filePath, buf);
  }

  const db = await getDb();
  const spec = await db.teamSpecDocument.upsert({
    where: { teamId },
    create: { teamId, fileName: file.name, filePath, mimeType: file.type || "application/pdf", extractedText: null, uploadedById: userId },
    update: { fileName: file.name, filePath, mimeType: file.type || "application/pdf", extractedText: null, uploadedAt: new Date(), uploadedById: userId },
  });

  return NextResponse.json({
    ok: true,
    spec: { fileName: spec.fileName, extractedText: spec.extractedText, uploadedAt: spec.uploadedAt.toISOString() },
  });
}
