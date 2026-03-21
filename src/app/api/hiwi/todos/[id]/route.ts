import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/lib/auth";
import { getCurrentRole } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import type { AppRole } from "@/types/next-auth";

function requireHiwiOrAdmin(role: AppRole | null) {
  return role === "HIWI" || role === "ADMIN";
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const role = await getCurrentRole();
  if (!requireHiwiOrAdmin(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const todoId = params.id;
  const body = await req.json().catch(() => null);
  const done = typeof body?.done === "boolean" ? body.done : undefined;

  const existing = await prisma.hiwiTodo.findUnique({ where: { id: todoId } });
  if (!existing || existing.userId !== userId) {
    return NextResponse.json({ error: "Not found or not yours" }, { status: 404 });
  }

  const updated = await prisma.hiwiTodo.update({
    where: { id: todoId },
    data: { done },
  });

  return NextResponse.json({ todo: updated });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const role = await getCurrentRole();
  if (!requireHiwiOrAdmin(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const todoId = params.id;

  const existing = await prisma.hiwiTodo.findUnique({ where: { id: todoId } });
  if (!existing || existing.userId !== userId) {
    return NextResponse.json({ error: "Not found or not yours" }, { status: 404 });
  }

  await prisma.hiwiTodo.delete({ where: { id: todoId } });

  return NextResponse.json({ success: true });
}
