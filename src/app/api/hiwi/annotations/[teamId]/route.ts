import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/lib/auth";
import { getCurrentRole } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: { teamId: string } }) {
  const role = await getCurrentRole();
  if (role !== "HIWI" && role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const spec = await prisma.teamSpecDocument.findUnique({
    where: { teamId: params.teamId },
  });

  if (!spec) {
    return NextResponse.json({ annotations: [] });
  }

  const annotations = await prisma.pdfAnnotation.findMany({
    where: { teamSpecId: spec.id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({
    annotations: annotations.map((a: { id: string; content: string; createdAt: Date }) => ({
      id: a.id,
      content: JSON.parse(a.content),
      createdAt: a.createdAt.toISOString(),
    })),
  });
}

export async function POST(req: Request, { params }: { params: { teamId: string } }) {
  const role = await getCurrentRole();
  if (role !== "HIWI" && role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const spec = await prisma.teamSpecDocument.findUnique({ where: { teamId: params.teamId } });
  if (!spec) return NextResponse.json({ error: "Kein Dokument gefunden." }, { status: 404 });

  const body = await req.json().catch(() => null);
  if (!body?.annotation) return NextResponse.json({ error: "Keine Annotation übermittelt." }, { status: 400 });

  const annotation = await prisma.pdfAnnotation.create({
    data: {
      teamSpecId: spec.id,
      content: JSON.stringify(body.annotation),
      createdById: userId,
    },
  });

  return NextResponse.json({ id: annotation.id });
}

export async function DELETE(req: Request, { params }: { params: { teamId: string } }) {
  const role = await getCurrentRole();
  if (role !== "HIWI" && role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const annotationId = body?.annotationId;
  if (!annotationId) return NextResponse.json({ error: "Annotation ID fehlt." }, { status: 400 });

  await prisma.pdfAnnotation.delete({ where: { id: annotationId } });
  return NextResponse.json({ ok: true });
}
