import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/lib/auth";
import { getCurrentRole } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import type { AppRole } from "@/types/next-auth";

function requireStudent(role: AppRole | null) {
  return role === "STUDENT";
}

export async function GET() {
  const role = await getCurrentRole();
  if (!requireStudent(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const todos = await prisma.studentTodo.findMany({
    where: { userId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return NextResponse.json({ todos });
}

export async function POST(req: Request) {
  const role = await getCurrentRole();
  if (!requireStudent(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  if (!title) return NextResponse.json({ error: "Titel fehlt." }, { status: 400 });

  const maxOrder = await prisma.studentTodo.aggregate({
    where: { userId },
    _max: { sortOrder: true },
  });
  const sortOrder = (maxOrder._max.sortOrder ?? 0) + 1;

  const todo = await prisma.studentTodo.create({
    data: { userId, title, sortOrder },
  });

  return NextResponse.json({ todo });
}
