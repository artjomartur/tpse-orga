import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { prisma } from "@/lib/prisma";
import { getCurrentRole } from "@/lib/authz";
import { authOptions } from "@/lib/auth";
import type { AppRole } from "@/types/next-auth";

function requireHiwi(role: AppRole | null) {
  return role === "HIWI" || role === "ADMIN";
}

export async function GET() {
  const schedule = await prisma.scheduleItem.findMany({
    orderBy: { date: "asc" },
  });
  return NextResponse.json({ schedule });
}

export async function POST(req: Request) {
  const role = await getCurrentRole();
  if (!requireHiwi(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const session = await getServerSession(authOptions);
  const createdById = session?.user?.id;
  if (!createdById) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const title = String(body?.title ?? "").trim();
  const type = String(body?.type ?? "").trim();
  const dateRaw = body?.date ? String(body.date) : "";
  const date = new Date(dateRaw);

  if (!title || !type || Number.isNaN(date.getTime())) {
    return NextResponse.json({ error: "Titel, Typ und gültiges Datum sind erforderlich." }, { status: 400 });
  }

  const item = await prisma.scheduleItem.create({
    data: {
      title,
      type,
      date,
      createdById,
    },
  });

  return NextResponse.json({ item });
}

