# Cloudflare Build – warum es scheitert & was du tun kannst

## Kurzfassung

Dieses Projekt ist als **Node.js-Server** gedacht (`next start` + Prisma + SQLite-Datei).  
**Cloudflare Workers/Pages** haben **kein klassisches Node-Dateisystem** und **keine lokale SQLite-Datei** wie auf deinem Rechner.

Ein reines:

```bash
npm run build
npx wrangler deploy
```

reicht **nicht**: `next build` erzeugt Artefakte für **Node**, nicht automatisch ein **Cloudflare Worker**-Bundle. Außerdem fehlen oft **Umgebungsvariablen** (im Screenshot: *Environment variables: None*).

---

## Typische Build-Fehler auf Cloudflare

| Problem | Folge |
|--------|--------|
| Nur `npm run build` + `wrangler deploy` ohne Next-Adapter | Falsches/fehlendes Output für Workers |
| Keine `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `DATABASE_URL` | Build oder Laufzeit bricht ab |
| SQLite (`file:./dev.db`) | Auf Workers **nicht nutzbar** wie lokal |
| `prisma generate` fehlt in CI | Fehlender Prisma Client |

---

## Option A (empfohlen): Hosting mit echtem Node

Am wenigsten Umbau für **dieses** Repo:

- **Vercel** (Next.js „native“)
- **Railway**, **Render**, **Fly.io**, **Coolify**, …

Dort: `DATABASE_URL` auf **PostgreSQL** (z. B. Neon, Supabase) umstellen, Migrationen fahren, `NEXTAUTH_URL` = deine Produktions-URL.

---

## Option B: Wirklich auf Cloudflare bleiben

Das ist ein **größeres Projekt**:

1. **Datenbank**: SQLite-Datei durch **Cloudflare D1** (oder externes Postgres) ersetzen, Prisma nach [Prisma + D1](https://www.prisma.io/docs/orm/overview/databases/cloudflare-d1) konfigurieren.
2. **Next.js auf Cloudflare**: Aktuell z. B. **OpenNext** / offizielle **Cloudflare + Next**-Vorlagen nutzen – nicht nur `next build`.
3. **Edge-Runtime**: Viele API-Routen müssten für Edge geprüft werden (NextAuth, `pdf-parse`, Dateizugriffe sind problematisch).

Solange die App **lokal mit SQLite + Node** läuft, ist **Option A** fast immer schneller und stabiler.

---

## Mindest-Konfiguration in Cloudflare (falls du weit experimentierst)

- **Node-Version** z. B. **20** (Build-Umgebung / Umgebungsvariable `NODE_VERSION`).
- **Build command** z. B.:

  ```bash
  npm ci && npx prisma generate && npm run build
  ```

- **Secrets** setzen: `NEXTAUTH_SECRET`, `NEXTAUTH_URL` (deine Domain), sinnvolle `DATABASE_URL` (nicht `file:…` auf Workers).

---

## Fazit

Der rote Build auf Cloudflare kommt selten von „fehlenden error.tsx“-Komponenten, sondern von **Deployment-Ziel + DB + fehlenden Env-Vars**.  
Für Produktion mit wenig Risiko: **Node-Hosting + Postgres** statt Edge + SQLite-Datei.

---

## OpenNext / `migrate` und die Cache-Warnung

Wenn du **`@opennextjs/cloudflare migrate`** nutzt und Meldungen wie *„Failed to set up cache … manually setup cache in wrangler.jsonc and open-next.config.ts“* siehst:  
→ Kurz erklärt in **`docs/opennext-cache-warn.md`** (Optionen ohne R2 vs. mit R2, Next 15 vs. 14).
