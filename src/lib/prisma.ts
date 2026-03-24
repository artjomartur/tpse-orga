import { PrismaClient } from "@prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";

// Singleton to store the initialized client
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * Returns a standard PrismaClient for local development or Cloudflare D1 in production.
 */
async function initializePrisma() {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  const env = process.env as any;
  const runtime = env.NEXT_RUNTIME;
  const isCloudflare = runtime === "edge" || runtime === "nodejs" || typeof (globalThis as any).WebSocketPair !== "undefined";

  if (isCloudflare) {
    try {
      // In OpenNext, getCloudflareContext is the reliable way to get bindings
      const { env: cfEnv } = await getCloudflareContext();
      
      // Try to find D1 binding in all possible places
      const d1 = (cfEnv as any)?.DB || (globalThis as any).DB || env.DB;

      if (d1 && typeof d1.prepare === "function") {
        const adapter = new PrismaD1(d1);
        const p = new PrismaClient({ adapter } as any);
        globalForPrisma.prisma = p;
        return p;
      }
      
      console.error(`D1 binding 'DB' not found in Cloudflare context. Available keys: ${cfEnv ? Object.keys(cfEnv).join(", ") : "none"}`);
    } catch (e) {
      console.error("Cloudflare context initialization failed:", e);
    }
  }

  // FALLBACK PREVENTION: If we are in production or any Edge-like runtime,
  // we MUST NOT initialize a standard PrismaClient without an adapter.
  if (env.NODE_ENV === "production" || isCloudflare) {
     throw new Error(`Prisma Error: Standard client cannot be initialized in ${env.NODE_ENV} / ${runtime}. D1 adapter required.`);
  }

  // Local development (SQLite) - only if we are sure we are local
  const p = new PrismaClient({
    log: ["error", "warn"],
  });

  globalForPrisma.prisma = p;
  return p;
}

// Top-level await to ensure prisma is ready before anything else uses it.
export const prisma = await initializePrisma();

/**
 * Factory for Cloudflare Workers: pass in the D1 binding from the request env.
 */
export async function getPrismaWithD1(d1: any) {
  const adapter = new PrismaD1(d1);
  return new PrismaClient({ adapter } as any);
}
