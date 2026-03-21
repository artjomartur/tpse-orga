import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentRole } from "@/lib/authz";
import type { AppRole } from "@/types/next-auth";

function requireHiwi(role: AppRole | null) {
  return role === "HIWI" || role === "ADMIN";
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const role = await getCurrentRole();
  if (!requireHiwi(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const team = await prisma.team.findUnique({
    where: { id: params.id },
    include: {
      members: {
        include: {
          user: { select: { id: true, email: true, name: true, role: true } },
        },
      },
    },
  });

  if (!team) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ team });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const role = await getCurrentRole();
  if (!requireHiwi(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));

  const updateData: Record<string, unknown> = {};
  if (body?.name !== undefined) updateData.name = String(body.name).trim();
  if (body?.maxMembers !== undefined) updateData.maxMembers = Number(body.maxMembers);

  if (body?.memberEmails !== undefined && Array.isArray(body.memberEmails)) {
    const memberEmails: string[] = Array.from(
      new Set(
        (body.memberEmails as unknown[]).map((e) => String(e).trim().toLowerCase()).filter(Boolean),
      ),
    );

    // Replace members: delete old relations first, then re-create.
    const users = await prisma.user.findMany({
      where: { email: { in: memberEmails } },
      select: { id: true, email: true },
    });
    const foundEmails = new Set(users.map((u) => u.email.toLowerCase()));
    const missingEmails = memberEmails.filter((e: string) => !foundEmails.has(e));
    if (missingEmails.length > 0) {
      return NextResponse.json({ error: "Unbekannte Nutzer (E-Mails):", missingEmails }, { status: 400 });
    }

    await prisma.teamMember.deleteMany({ where: { teamId: params.id } });

    await prisma.teamMember.createMany({
      data: users.map((u) => ({ userId: u.id, teamId: params.id })),
    });
  }

  const updated = await prisma.team.update({
    where: { id: params.id },
    data: updateData as any,
    include: {
      members: {
        include: {
          user: { select: { id: true, email: true, name: true, role: true } },
        },
      },
    },
  });

  return NextResponse.json({ team: updated });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const role = await getCurrentRole();
  if (!requireHiwi(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // No cascade configured -> delete relations first.
  await prisma.teamMember.deleteMany({ where: { teamId: params.id } });
  await prisma.team.delete({ where: { id: params.id } });

  return NextResponse.json({ ok: true });
}

