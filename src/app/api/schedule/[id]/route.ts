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
  const type = body?.type !== undefined ? String(body.type).trim() : null;
  const dateRaw = body?.date !== undefined ? String(body.date) : null;

  const data: Record<string, unknown> = { createdById };
  if (title) data.title = title;
  if (type) data.type = type;
  if (dateRaw) data.date = new Date(dateRaw);

  const item = await prisma.scheduleItem.update({
    where: { id: params.id },
    data,
  });

  return NextResponse.json({ item });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const role = await getCurrentRole();
  if (!requireHiwi(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.scheduleItem.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}

