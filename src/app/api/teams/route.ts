import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentRole } from "@/lib/authz";
import type { AppRole } from "@/types/next-auth";

function requireHiwi(role: AppRole | null) {
  return role === "HIWI" || role === "ADMIN";
}

export async function GET() {
  const role = await getCurrentRole();
  if (!requireHiwi(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const teams = await prisma.team.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      members: {
        include: {
          user: { select: { id: true, email: true, name: true, role: true } },
        },
      },
    },
  });

  return NextResponse.json({ teams });
}

export async function POST(req: Request) {
  const role = await getCurrentRole();
  if (!requireHiwi(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const name = String(body?.name ?? "").trim();
  const maxMembers = Number(body?.maxMembers ?? 5);
  const memberEmails: string[] = Array.isArray(body?.memberEmails)
    ? (body.memberEmails as unknown[]).map((e) => String(e).trim().toLowerCase()).filter(Boolean)
    : [];
  const uniqueMemberEmails: string[] = Array.from(new Set(memberEmails));

  if (!name) {
    return NextResponse.json({ error: "Teamname fehlt." }, { status: 400 });
  }

  const created = await prisma.team.create({
    data: {
      name,
      maxMembers: Number.isFinite(maxMembers) ? maxMembers : 5,
    },
  });

  if (uniqueMemberEmails.length > 0) {
    const users = await prisma.user.findMany({
      where: { email: { in: uniqueMemberEmails } },
      select: { id: true, email: true },
    });
    const foundEmails = new Set(users.map((u) => u.email.toLowerCase()));
    const missingEmails = uniqueMemberEmails.filter((e) => !foundEmails.has(e));

    if (missingEmails.length > 0) {
      // Rollback: delete the empty team.
      await prisma.team.delete({ where: { id: created.id } });
      return NextResponse.json(
        { error: "Unbekannte Nutzer (E-Mails):", missingEmails },
        { status: 400 },
      );
    }

    await prisma.teamMember.createMany({
      data: users.map((u) => ({ userId: u.id, teamId: created.id })),
    });
  }

  const team = await prisma.team.findUnique({
    where: { id: created.id },
    include: {
      members: {
        include: {
          user: { select: { id: true, email: true, name: true, role: true } },
        },
      },
    },
  });

  return NextResponse.json({ team });
}

