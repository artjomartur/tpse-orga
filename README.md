# TPSE Orga-Plattform

Eine Full-Stack-Organisationplattform für das TU Darmstadt Modul **TPSE** (Teamprojekt Software Engineering) mit:
- Teamverwaltung
- Abgaben-Uploads und Upload-Status
- Bewertung (Punkte + Feedback)
- Ankündigungen, Termine und Ressourcen

## Quickstart (lokal)

```bash
cd /Users/artjombecker/tpse-orga
npm install

# DB (SQLite) initialisieren
npm run db:push

# Seed: Admin-User anlegen
npm run db:seed

# Dev starten
npm run dev
```

Dann im Browser öffnen: `http://localhost:3000`

## Admin-Login (Seed)

Default-Werte stehen in `.env` / `.env.local`:
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

Nach `npm run db:seed` kannst du dich damit einloggen (Rolle: `ADMIN`).

## Studierenden-Registrierung

Die Seite `/register` erstellt User mit Rolle `STUDENT`.

Optionaler Schutz:
- Setze `STUDENT_INVITE_TOKEN`, dann wird beim Registrieren ein Token benötigt.
- Wenn leer (`""`), ist Registrierung ohne Token möglich.

## Datei-Uploads

Uploads werden lokal gespeichert unter:
- `public/uploads/<teamId>/...`

Die gespeicherte URL lautet entsprechend: `/uploads/<teamId>/filename`.

## Deployment

Empfohlen (Vercel):
1. Projekt-Env-Variablen setzen (`DATABASE_URL`, `NEXTAUTH_SECRET`, etc.)
2. DB-Migrations/`db push` einmalig beim Deploy/Setup ausführen (je nach Ziel-DB)
3. `npm run build` und danach `npm run start`.

