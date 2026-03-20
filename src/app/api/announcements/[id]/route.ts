import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { prisma } from "@/lib/prisma";
import { getCurrentRole } from "@/lib/authz";
import { authOptions } from "@/lib/auth";
import type { AppRole } from "@/types/next-auth";

function requireHiwi(role: AppRole | null) {
  return role === "HIWI" || role === "ADMIN";
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const role = await getCurrentRole();
  if (!requireHiwi(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const session = await getServerSession(authOptions);
  const createdById = session?.user?.id;
  if (!createdById) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const title = body?.title !== undefined ? String(body.title).trim() : null;
  const content = body?.content !== undefined ? String(body.content).trim() : null;

  if (!title && !content) return NextResponse.json({ error: "Keine Daten." }, { status: 400 });

  const announcement = await prisma.announcement.update({
    where: { id: params.id },
    data: {
      title: title ?? undefined,
      content: content ?? undefined,
      createdById,
    },
  });

  return NextResponse.json({ announcement });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const role = await getCurrentRole();
  if (!requireHiwi(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.announcement.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}

