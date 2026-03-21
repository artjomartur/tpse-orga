import { NextResponse } from "next/server";
import { getCurrentRole } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const role = await getCurrentRole();
  if (role !== "HIWI" && role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const docs = await prisma.teamSpecDocument.findMany({
    include: { team: { select: { id: true, name: true } } },
    orderBy: { uploadedAt: "desc" },
  });

  const specs = docs.map((d) => ({
    teamId: d.team.id,
    teamName: d.team.name,
    fileName: d.fileName,
    uploadedAt: d.uploadedAt.toISOString(),
  }));

  return NextResponse.json({ specs });
}
