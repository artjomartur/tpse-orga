import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/lib/auth";
import { getCurrentRole } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import type { AppRole } from "@/types/next-auth";

function requireStudent(role: AppRole | null) {
  return role === "STUDENT";
}

export async function POST(req: Request) {
  const role = await getCurrentRole();
  if (!requireStudent(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const existing = await prisma.teamMember.findFirst({ where: { userId } });
  if (existing) return NextResponse.json({ error: "Du bist bereits in einem Team." }, { status: 409 });

  const body = await req.json().catch(() => ({}));
  const name = String(body?.name ?? "").trim();
  const emailsInput: unknown[] = Array.isArray(body?.memberEmails) ? body.memberEmails : [];
  const memberEmails = Array.from(
    new Set(emailsInput.map((e: unknown) => String(e).trim().toLowerCase()).filter(Boolean)),
  );

  if (!name) return NextResponse.json({ error: "Teamname fehlt." }, { status: 400 });

  const me = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, role: true } });
  if (!me) return NextResponse.json({ error: "Nutzer nicht gefunden." }, { status: 404 });

  const allEmails = Array.from(new Set([me.email.toLowerCase(), ...memberEmails]));
  if (allEmails.length < 2 || allEmails.length > 5) {
    return NextResponse.json({ error: "MiniGruppe muss 2 bis 5 Personen haben." }, { status: 400 });
  }

  const users = await prisma.user.findMany({
    where: { email: { in: allEmails } },
    select: { id: true, email: true, role: true },
  });
  if (users.length !== allEmails.length) {
    return NextResponse.json({ error: "Nicht alle E-Mails wurden gefunden." }, { status: 400 });
  }
  if (users.some((u) => u.role !== "STUDENT")) {
    return NextResponse.json({ error: "Nur STUDENT Nutzer sind erlaubt." }, { status: 400 });
  }

  const existingMembers = await prisma.teamMember.findMany({
    where: { userId: { in: users.map((u) => u.id) } },
    select: { userId: true },
  });
  if (existingMembers.length > 0) {
    return NextResponse.json({ error: "Mindestens ein Mitglied ist bereits in einem Team." }, { status: 409 });
  }

  const team = await prisma.team.create({
    data: {
      name,
      maxMembers: 5,
      members: {
        create: users.map((u) => ({ userId: u.id })),
      },
    },
  });

  return NextResponse.json({ team });
}

