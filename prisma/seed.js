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

  // Alte Zuordnungen der Test-Studierenden entfernen, damit /my-team das Zuordnungs-Tool zeigt.
  await prisma.teamMember.deleteMany({
    where: { userId: { in: createdUsers.map((u) => u.id) } },
  });

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

  // Keine automatische Zuordnung: Studierende sollen das Zuordnungs-Tool unter /my-team nutzen.
  // Das Team bleibt als leeres/offenes Beispiel in der Liste (0 Mitglieder), sofern neu angelegt.
  console.log(
    `Demo-Team "${team.name}" bereitgestellt (ohne feste Mitgliedszuordnung). ${createdUsers.length} Test-Accounts ohne Team.`,
  );

  const projectTitles = [
    { title: "Smart Campus Navigator", description: "Indoor-Navigation und Raumbelegung." },
    { title: "Nachhaltige Lieferkette", description: "CO₂-Fußabdruck von Produkten transparent machen." },
    { title: "Peer-Learning Plattform", description: "Lernpartner:innen finden und Sessions planen." },
    { title: "Event Safety Dashboard", description: "Crowd-Management für Veranstaltungen." },
    { title: "Gesundheits-Check-in", description: "Anonyme Symptom-Trends für Praxen (Demo)." },
    { title: "Repair-Café App", description: "Reparatur-Termine und Ersatzteile koordinieren." },
    { title: "Stadtgrün Mitmachen", description: "Bürgerbeteiligung bei Bepflanzung und Pflege." },
    { title: "Barrierefreies Voting", description: "Digitale Abstimmungen barrierearm umsetzen." },
    { title: "Lernstand-Tracker", description: "Kompetenzen für Teams sichtbar machen." },
    { title: "Open Data Visualisierung", description: "Kommunale Daten verständlich aufbereiten." },
    { title: "Krisen-Kommunikation", description: "Vorlagen und Kanäle für Hochschul-Krisenfälle." },
    { title: "Labor-Equipment Sharing", description: "Gerätebuchung und Wartungsstatus." },
  ];

  let order = 0;
  for (const p of projectTitles) {
    const existing = await prisma.project.findFirst({ where: { title: p.title } });
    if (!existing) {
      await prisma.project.create({
        data: { title: p.title, description: p.description, sortOrder: order++ },
      });
    }
  }
  console.log(`Projektkatalog: ${projectTitles.length} Einträge (neu angelegt, falls noch nicht vorhanden).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

