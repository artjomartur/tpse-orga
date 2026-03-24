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
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ announcements });
  } catch (e) {
    console.error("Database query failed, returning mock announcements", e);
    return NextResponse.json({
      announcements: [
        {
          id: "mock-1",
          title: "Willkommen zum Projekt-Semester!",
          content: "Schön, dass ihr alle dabei seid. In diesem Dashboard findet ihr alle wichtigen Infos.",
          createdAt: new Date().toISOString(),
        },
        {
          id: "mock-2",
          title: "Mario Movie Menüs & Merch (Beispiel)",
          content: "Wie in der internen Mitteilung besprochen: Yoshi-Eimer sind für Mitarbeiter nicht zum Kauf freigegeben.",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ],
    });
  }
}

export async function POST(req: Request) {
  const role = await getCurrentRole();
  if (!requireHiwi(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const session = await getServerSession(authOptions);
  const createdById = session?.user?.id;
  if (!createdById) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const title = String(body?.title ?? "").trim();
  const content = String(body?.content ?? "").trim();

  if (!title || !content) {
    return NextResponse.json({ error: "Titel und Inhalt sind erforderlich." }, { status: 400 });
  }

  const announcement = await prisma.announcement.create({
    data: {
      title,
      content,
      createdById,
    },
  });

  return NextResponse.json({ announcement });
}

