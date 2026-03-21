import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { writeFile, unlink } from "fs/promises";

import { authOptions } from "@/lib/auth";
import { getCurrentRole } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { getStudentTeamMembership } from "@/lib/student-team";
import { ensureTeamSpecsDir, teamSpecFilePath } from "@/lib/uploads";
import type { AppRole } from "@/types/next-auth";

export const runtime = "nodejs";

const MAX_BYTES = 12 * 1024 * 1024; // 12 MB

function requireStudent(role: AppRole | null) {
  return role === "STUDENT";
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

  const spec = await prisma.teamSpecDocument.findUnique({
    where: { teamId: membership.teamId },
  });

  if (!spec) {
    return NextResponse.json({
      spec: null,
      team: { id: membership.team.id, name: membership.team.name },
    });
  }

  return NextResponse.json({
    team: { id: membership.team.id, name: membership.team.name },
    spec: {
      fileName: spec.fileName,
      extractedText: spec.extractedText,
      uploadedAt: spec.uploadedAt.toISOString(),
    },
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
    return NextResponse.json({ error: "Keine Datei (Feld „file“) übergeben." }, { status: 400 });
  }

  if (file.type && file.type !== "application/pdf") {
    return NextResponse.json({ error: "Nur PDF-Dateien sind erlaubt." }, { status: 400 });
  }

  const lower = file.name.toLowerCase();
  if (!lower.endsWith(".pdf")) {
    return NextResponse.json({ error: "Dateiname muss auf .pdf enden." }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.length > MAX_BYTES) {
    return NextResponse.json({ error: "PDF ist zu groß (max. ca. 12 MB)." }, { status: 400 });
  }

  let extractedText: string;
  try {
    // Dynamisch laden: das Paket führt beim direkten Import im Bundle Testcode aus (module.parent).
    const pdfParse = (await import("pdf-parse")).default;
    const parsed = await pdfParse(buf);
    extractedText = (parsed.text ?? "").trim();
  } catch {
    return NextResponse.json({ error: "PDF konnte nicht gelesen werden (evtl. verschlüsselt oder beschädigt)." }, { status: 400 });
  }

  await ensureTeamSpecsDir();
  const teamId = membership.teamId;
  const dest = teamSpecFilePath(teamId);

  const existing = await prisma.teamSpecDocument.findUnique({ where: { teamId } });
  if (existing?.filePath) {
    try {
      await unlink(existing.filePath);
    } catch {
      // ignore
    }
  }

  await writeFile(dest, buf);

  const spec = await prisma.teamSpecDocument.upsert({
    where: { teamId },
    create: {
      teamId,
      fileName: file.name,
      filePath: dest,
      mimeType: file.type || "application/pdf",
      extractedText: extractedText || null,
      uploadedById: userId,
    },
    update: {
      fileName: file.name,
      filePath: dest,
      mimeType: file.type || "application/pdf",
      extractedText: extractedText || null,
      uploadedAt: new Date(),
      uploadedById: userId,
    },
  });

  return NextResponse.json({
    ok: true,
    spec: {
      fileName: spec.fileName,
      extractedText: spec.extractedText,
      uploadedAt: spec.uploadedAt.toISOString(),
    },
  });
}
