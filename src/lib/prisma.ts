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
  const isCloudflare = env.NEXT_RUNTIME === "edge" || env.NEXT_RUNTIME === "nodejs" || typeof (globalThis as any).WebSocketPair !== "undefined";

  if (isCloudflare) {
    try {
      // In OpenNext, getCloudflareContext is the reliable way to get bindings
      const { env: cfEnv } = await getCloudflareContext();
      const d1 = (cfEnv as any).DB;

      if (d1 && typeof d1.prepare === "function") {
        const adapter = new PrismaD1(d1);
        const p = new PrismaClient({ adapter } as any);
        globalForPrisma.prisma = p;
        return p;
      }
    } catch (e) {
      console.error("Cloudflare context initialization failed:", e);
    }
  }

  // Fallback for local development or if D1 is missing
  const p = new PrismaClient({
    log: env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

  if (env.NODE_ENV !== "production") globalForPrisma.prisma = p;
  return p;
}

// Top-level await to ensure prisma is ready before anything else uses it.
// This works in Cloudflare Workers and modern Next.js environments.
export const prisma = await initializePrisma();

/**
 * Backward compatibility helper
 */
export async function getLocalPrisma() {
  return prisma;
}

/**
 * Factory for Cloudflare Workers: pass in the D1 binding from the request env.
 */
export async function getPrismaWithD1(d1: any) {
  const adapter = new PrismaD1(d1);
  return new PrismaClient({ adapter } as any);
}
