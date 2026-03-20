import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const name = String(body?.name ?? "").trim();
    const password = String(body?.password ?? "");
    const inviteToken = String(body?.inviteToken ?? "").trim();

    if (!email || !password || !name) {
      return NextResponse.json({ error: "E-Mail, Name und Passwort sind erforderlich." }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Diese E-Mail ist bereits registriert." }, { status: 409 });
    }

    const expectedToken = (process.env.STUDENT_INVITE_TOKEN ?? "").trim();
    if (expectedToken.length > 0 && inviteToken !== expectedToken) {
      return NextResponse.json({ error: "Ungültiger Invite-Token." }, { status: 401 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        email,
        name,
        role: "STUDENT",
        passwordHash,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}

