import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { existsSync } from "fs";

import { getCurrentRole } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: { teamId: string } }) {
  const role = await getCurrentRole();
  if (role !== "HIWI" && role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { teamId } = params;
  if (!teamId) {
    return NextResponse.json({ error: "Team ID fehlt." }, { status: 400 });
  }

  const spec = await prisma.teamSpecDocument.findUnique({ where: { teamId } });
  if (!spec || !spec.filePath) {
    return NextResponse.json({ error: "Kein Dokument gefunden." }, { status: 404 });
  }

  if (!existsSync(spec.filePath)) {
    return NextResponse.json({ error: "Datei nicht mehr vorhanden." }, { status: 404 });
  }

  const buf = await readFile(spec.filePath);

  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${spec.fileName}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
