require("dotenv").config({ path: ".env" });

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const password = (process.env.ADMIN_PASSWORD ?? "").trim();
  const name = (process.env.ADMIN_NAME ?? "").trim();

  if (!email || !password) {
    throw new Error("Missing ADMIN_EMAIL or ADMIN_PASSWORD in environment.");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: { name, role: "ADMIN", passwordHash },
    create: { email, name, role: "ADMIN", passwordHash },
  });

  console.log(`Seeded admin user: ${email}`);

  // --- Gruppenfindung: 5 Test-Studierende + 1 Gruppe ---
  const studentPasswordHash = await bcrypt.hash("student123", 10);
  const students = [
    { email: "anna.mueller@tpse.test", name: "Anna Müller" },
    { email: "ben.schmidt@tpse.test", name: "Ben Schmidt" },
    { email: "chiara.weber@tpse.test", name: "Chiara Weber" },
    { email: "david.fischer@tpse.test", name: "David Fischer" },
    { email: "emma.wagner@tpse.test", name: "Emma Wagner" },
  ];

  const createdUsers = [];
  for (const s of students) {
    const user = await prisma.user.upsert({
      where: { email: s.email.toLowerCase() },
      update: { name: s.name, passwordHash: studentPasswordHash, role: "STUDENT" },
      create: { email: s.email.toLowerCase(), name: s.name, role: "STUDENT", passwordHash: studentPasswordHash },
    });
    createdUsers.push(user);
  }

  let team = await prisma.team.findFirst({
    where: { name: "Gruppe 1 – Gruppenfindung" },
  });
  if (!team) {
    team = await prisma.team.create({
      data: {
        name: "Gruppe 1 – Gruppenfindung",
        projectName: "TPSE Testprojekt",
        maxMembers: 5,
      },
    });
  }

  for (const u of createdUsers) {
    await prisma.teamMember.upsert({
      where: {
        userId_teamId: { userId: u.id, teamId: team.id },
      },
      update: {},
      create: { userId: u.id, teamId: team.id },
    });
  }

  console.log(`Gruppenfindung: Team "${team.name}" mit ${createdUsers.length} Mitgliedern angelegt.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

