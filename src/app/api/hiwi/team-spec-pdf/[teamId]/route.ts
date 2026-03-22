import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getCurrentRole } from "@/lib/authz";
import { prisma, getPrismaWithD1 } from "@/lib/prisma";

async function getCfEnv(): Promise<Record<string, any> | null> {
  try { const { env } = await getCloudflareContext(); return (env as Record<string, any>) ?? null; } catch { return null; }
}

async function getDb() {
  const env = await getCfEnv();
  // Using explicit cast to any for D1Database to avoid {} mismatch in build env
  if (env?.DB) return getPrismaWithD1(env.DB as any);
  return prisma; // Static lazy prisma instance
}

export async function GET(_req: Request, { params }: { params: { teamId: string } }) {
  const role = await getCurrentRole();
  if (role !== "HIWI" && role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { teamId } = params;
  const db = await getDb();
  const spec = await db.teamSpecDocument.findUnique({ where: { teamId } });
  if (!spec || !spec.filePath) {
    return NextResponse.json({ error: "Kein Dokument gefunden." }, { status: 404 });
  }

  const r2Key = spec.filePath; // In production, filePath stores the R2 key
  const cfEnv = await getCfEnv();

  if (cfEnv?.PDF_BUCKET) {
    const obj = await (cfEnv.PDF_BUCKET as any).get(r2Key);
    if (!obj) return NextResponse.json({ error: "Datei nicht in R2 gefunden." }, { status: 404 });
    const ab = await obj.arrayBuffer();
    return new NextResponse(ab, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${spec.fileName}"`,
        "Cache-Control": "private, no-store",
      },
    });
  }

  // Local dev fallback: read from filesystem
  const fs = await import("fs/promises");
  const { existsSync } = await import("fs");
  if (!existsSync(spec.filePath)) {
    return NextResponse.json({ error: "Datei nicht mehr vorhanden." }, { status: 404 });
  }
  const buf = await fs.readFile(spec.filePath);
  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${spec.fileName}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
