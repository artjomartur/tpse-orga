# Dev: „missing required error components, refreshing…“

Diese Meldung kommt **nicht** von fehlendem `error.tsx`, sondern fast immer von einem **inkonsistenten Dev-Server** oder **kaputtem `.next`**.

## Checkliste

1. **Nur einen Dev-Server** – kein zweites `npm run dev` in einem anderen Terminal.
2. **Port 3000 frei** – bei `EADDRINUSE`:
   ```bash
   npm run kill:3000
   ```
3. **Cache neu** (Dev gestoppt, dann):
   ```bash
   rm -rf .next && npm run dev
   ```
   oder: `npm run dev:clean:kill`
4. **Nicht parallel** `npm run build` laufen lassen, während `npm run dev` aktiv ist.
5. **Nach `git pull` / `npm install`**: einmal `rm -rf .next` und Dev neu starten.

## ESLint

Es gibt eine feste Konfiguration (`.eslintrc.json` + `eslint-config-next` passend zu Next 14).  
`npm run lint` sollte **ohne** interaktive Fragen durchlaufen.
