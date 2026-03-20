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
  const resources = await prisma.resource.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ resources });
}

export async function POST(req: Request) {
  const role = await getCurrentRole();
  if (!requireHiwi(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const session = await getServerSession(authOptions);
  const createdById = session?.user?.id;
  if (!createdById) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const title = String(body?.title ?? "").trim();
  const url = String(body?.url ?? "").trim();
  const category = body?.category ? String(body.category).trim() : null;

  if (!title || !url) {
    return NextResponse.json({ error: "Titel und URL sind erforderlich." }, { status: 400 });
  }

  const resource = await prisma.resource.create({
    data: { title, url, category, createdById },
  });

  return NextResponse.json({ resource });
}

