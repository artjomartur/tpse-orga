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
  const url = body?.url !== undefined ? String(body.url).trim() : null;
  const category = body?.category !== undefined ? (body.category ? String(body.category).trim() : null) : null;

  const data: Record<string, unknown> = { createdById };
  if (title) data.title = title;
  if (url) data.url = url;
  if (body?.category !== undefined) data.category = category;

  const resource = await prisma.resource.update({
    where: { id: params.id },
    data,
  });

  return NextResponse.json({ resource });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const role = await getCurrentRole();
  if (!requireHiwi(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.resource.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}

