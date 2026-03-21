import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/lib/auth";
import { getCurrentRole } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import type { AppRole } from "@/types/next-auth";

function requireHiwiOrAdmin(role: AppRole | null) {
  return role === "HIWI" || role === "ADMIN";
}

export async function GET() {
  const role = await getCurrentRole();
  if (!requireHiwiOrAdmin(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const activities = await prisma.hiwiActivity.findMany({
    where: { userId },
    orderBy: { date: "desc" },
  });

  return NextResponse.json({ activities });
}

export async function POST(req: Request) {
  const role = await getCurrentRole();
  if (!requireHiwiOrAdmin(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const description = typeof body?.description === "string" ? body.description.trim() : null;
  const minutes = typeof body?.minutes === "number" ? body.minutes : 0;
  
  if (!title) return NextResponse.json({ error: "Titel fehlt." }, { status: 400 });

  const activity = await prisma.hiwiActivity.create({
    data: { userId, title, description, minutes },
  });

  return NextResponse.json({ activity });
}
