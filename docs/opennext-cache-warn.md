# OpenNext: „Failed to set up cache“ / manuelles Cache-Setup

## Was die Meldung bedeutet

Beim Befehl `npx @opennextjs/cloudflare migrate` (oder ähnlich) erscheint z. B.:

> WARN Failed to set up cache for your project. After the migration completes, please manually setup cache in `wrangler.jsonc` and `open-next.config.ts` …

Das heißt: **Automatisch** konnten die Komponenten für **ISR/SSG-Cache** (R2, Queue, ggf. Tag-Cache) **nicht** angelegt werden – z. B. weil **kein R2** in deinem Account freigeschaltet war oder die API den Bucket nicht anlegen konnte.

**SSR und normale API-Routen** funktionieren laut OpenNext-Doku **ohne** diese Cache-Bindings. Betroffen sind vor allem:

- **Incremental Static Regeneration (ISR)**
- **`revalidatePath` / `revalidateTag`**
- **Daten-Cache** von `fetch` mit Next-Caching

Wenn du das **nicht** nutzt, kann die Warnung **ignoriert** werden – oder du richtest unten eine **minimale** Cache-Variante ein.

---

## Option 1: Minimal (ohne R2) – „SSG / statischer Incremental Cache“

Laut [OpenNext – Caching – SSG site](https://opennext.js.org/cloudflare/caching#ssg-site) reicht für viele Apps:

- **Kein** R2, **keine** Queue, **kein** Tag-Cache
- In `open-next.config.ts`:

```ts
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
  enableCacheInterception: true,
});
```

**Voraussetzung:** Installierte Version von `@opennextjs/cloudflare`, die zu deiner **Next.js-Version** passt. Aktuelle **1.x**-Releases verlangen typischerweise **Next 15+** (siehe `peerDependencies` auf npm).

---

## Option 2: Voller Cache (R2 + Durable Objects + ggf. D1)

Wenn du **ISR / Revalidation** brauchst, folge der [Caching-Doku](https://opennext.js.org/cloudflare/caching):

1. R2-Bucket anlegen, Binding `NEXT_INC_CACHE_R2_BUCKET` in `wrangler.jsonc`
2. `WORKER_SELF_REFERENCE` Service-Binding
3. Queue über Durable Objects (`NEXT_CACHE_DO_QUEUE`) usw.

Das ist deutlich mehr Konfiguration und Cloudflare-Ressourcen.

---

## In diesem Repo

- **`public/_headers`** ist angelegt (lange Cache-TTL für `/_next/static/*`) – empfohlen von OpenNext.
- **`open-next.config.ts`** / **`wrangler.jsonc`**: werden von `migrate` generiert; du kannst sie nach Option 1 oder 2 anpassen, **sobald** `@opennextjs/cloudflare` und **Wrangler** zu deiner Next-Version passen.

---

## Next.js 14 vs. OpenNext aktuell

Die neueste `@opennextjs/cloudflare@1.x` verlangt **Next 15+**.  
Mit **Next 14** musst du entweder:

- **Next auf 15 upgraden** und dann OpenNext installieren, oder  
- eine **ältere** OpenNext-Version nutzen, die noch Next 14 unterstützt (Versionsmatrix prüfen – viele alte Versionen sind nicht mehr wartbar).

Für den **schnellsten** produktiven Betrieb mit Prisma/SQLite bleibt **Node-Hosting** (Vercel, Railway, …) oft einfacher als Workers.
