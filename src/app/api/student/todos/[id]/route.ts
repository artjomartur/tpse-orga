import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/lib/auth";
import { getCurrentRole } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import type { AppRole } from "@/types/next-auth";

function requireStudent(role: AppRole | null) {
  return role === "STUDENT";
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const role = await getCurrentRole();
  if (!requireStudent(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = params;
  const existing = await prisma.studentTodo.findFirst({ where: { id, userId } });
  if (!existing) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const data: { title?: string; done?: boolean; sortOrder?: number } = {};
  if (typeof body?.title === "string") data.title = body.title.trim() || existing.title;
  if (typeof body?.done === "boolean") data.done = body.done;
  if (typeof body?.sortOrder === "number" && Number.isFinite(body.sortOrder)) data.sortOrder = body.sortOrder;

  const todo = await prisma.studentTodo.update({
    where: { id },
    data,
  });

  return NextResponse.json({ todo });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const role = await getCurrentRole();
  if (!requireStudent(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = params;
  const existing = await prisma.studentTodo.findFirst({ where: { id, userId } });
  if (!existing) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });

  await prisma.studentTodo.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
