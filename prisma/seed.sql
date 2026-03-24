-- Admin User
INSERT OR IGNORE INTO "User" ("id", "email", "name", "role", "passwordHash", "createdAt") 
VALUES ('admin-id', 'admin@example.com', 'TPSE Admin', 'ADMIN', '$2b$10$vKfHTFXDW3qv.U7RSFLA6.06kRilB97JmSWZqwwFXHkWf4Fd1EuHO', CURRENT_TIMESTAMP);

-- Test Students
INSERT OR IGNORE INTO "User" ("id", "email", "name", "role", "passwordHash", "createdAt") 
VALUES ('student-1', 'anna.mueller@tpse.test', 'Anna Müller', 'STUDENT', '$2b$10$XMbrNhxSbsYW4dg3PIjUFOaDI2orm8WRcCKIElPEWKAY7.DA0FNcS', CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO "User" ("id", "email", "name", "role", "passwordHash", "createdAt") 
VALUES ('student-2', 'ben.schmidt@tpse.test', 'Ben Schmidt', 'STUDENT', '$2b$10$XMbrNhxSbsYW4dg3PIjUFOaDI2orm8WRcCKIElPEWKAY7.DA0FNcS', CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO "User" ("id", "email", "name", "role", "passwordHash", "createdAt") 
VALUES ('student-3', 'chiara.weber@tpse.test', 'Chiara Weber', 'STUDENT', '$2b$10$XMbrNhxSbsYW4dg3PIjUFOaDI2orm8WRcCKIElPEWKAY7.DA0FNcS', CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO "User" ("id", "email", "name", "role", "passwordHash", "createdAt") 
VALUES ('student-4', 'david.fischer@tpse.test', 'David Fischer', 'STUDENT', '$2b$10$XMbrNhxSbsYW4dg3PIjUFOaDI2orm8WRcCKIElPEWKAY7.DA0FNcS', CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO "User" ("id", "email", "name", "role", "passwordHash", "createdAt") 
VALUES ('student-5', 'emma.wagner@tpse.test', 'Emma Wagner', 'STUDENT', '$2b$10$XMbrNhxSbsYW4dg3PIjUFOaDI2orm8WRcCKIElPEWKAY7.DA0FNcS', CURRENT_TIMESTAMP);

-- Test Team
INSERT OR IGNORE INTO "Team" ("id", "name", "projectName", "maxMembers", "createdAt")
VALUES ('team-1', 'Gruppe 1 – Gruppenfindung', 'TPSE Testprojekt', 5, CURRENT_TIMESTAMP);

-- Project Catalog
INSERT OR IGNORE INTO "Project" ("id", "title", "description", "sortOrder") VALUES ('p1', 'Smart Campus Navigator', 'Indoor-Navigation und Raumbelegung.', 0);
INSERT OR IGNORE INTO "Project" ("id", "title", "description", "sortOrder") VALUES ('p2', 'Nachhaltige Lieferkette', 'CO₂-Fußabdruck von Produkten transparent machen.', 1);
INSERT OR IGNORE INTO "Project" ("id", "title", "description", "sortOrder") VALUES ('p3', 'Peer-Learning Plattform', 'Lernpartner:innen finden und Sessions planen.', 2);
INSERT OR IGNORE INTO "Project" ("id", "title", "description", "sortOrder") VALUES ('p4', 'Event Safety Dashboard', 'Crowd-Management für Veranstaltungen.', 3);
INSERT OR IGNORE INTO "Project" ("id", "title", "description", "sortOrder") VALUES ('p5', 'Gesundheits-Check-in', 'Anonyme Symptom-Trends für Praxen (Demo).', 4);
INSERT OR IGNORE INTO "Project" ("id", "title", "description", "sortOrder") VALUES ('p6', 'Repair-Café App', 'Reparatur-Termine und Ersatzteile koordinieren.', 5);
INSERT OR IGNORE INTO "Project" ("id", "title", "description", "sortOrder") VALUES ('p7', 'Stadtgrün Mitmachen', 'Bürgerbeteiligung bei Bepflanzung und Pflege.', 6);
INSERT OR IGNORE INTO "Project" ("id", "title", "description", "sortOrder") VALUES ('p8', 'Barrierefreies Voting', 'Digitale Abstimmungen barrierearm umsetzen.', 7);
INSERT OR IGNORE INTO "Project" ("id", "title", "description", "sortOrder") VALUES ('p9', 'Lernstand-Tracker', 'Kompetenzen für Teams sichtbar machen.', 8);
INSERT OR IGNORE INTO "Project" ("id", "title", "description", "sortOrder") VALUES ('p10', 'Open Data Visualisierung', 'Kommunale Daten verständlich aufbereiten.', 9);
INSERT OR IGNORE INTO "Project" ("id", "title", "description", "sortOrder") VALUES ('p11', 'Krisen-Kommunikation', 'Vorlagen und Kanäle für Hochschul-Krisenfälle.', 10);
INSERT OR IGNORE INTO "Project" ("id", "title", "description", "sortOrder") VALUES ('p12', 'Labor-Equipment Sharing', 'Gerätebuchung und Wartungsstatus.', 11);
