import { PrismaClient } from "@prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";

// Singleton to store the initialized client
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * Internal helper to get/initialize the client.
 */
async function getClientAsync(): Promise<PrismaClient> {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  try {
    const { env } = await getCloudflareContext();
    const d1 = (env as any).DB;

    if (d1 && typeof d1.prepare === "function") {
      const adapter = new PrismaD1(d1);
      const p = new PrismaClient({ adapter } as any);
      globalForPrisma.prisma = p;
      return p;
    }
  } catch (e) {
    console.error("Error getting Cloudflare context:", e);
  }

  // Local development (SQLite) fallback
  const p = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = p;
  return p;
}

/**
 * Direct initialization for the singleton.
 * Next.js on Cloudflare supports top-level await in many cases via OpenNext.
 */
let initializedClient: PrismaClient | null = null;

// This Proxy will handle the synchronous access by returning the models.
// But we need to make sure the methods called on these models are correctly handled.
// Since most Prisma calls are like 'await prisma.user.findMany()', 
// we can use a proxy that returns 'thenables' or better yet:
// just initialize it synchronously if we are NOT on Cloudflare, 
// and if we ARE on Cloudflare, we hope it's already warmed up or we use getPrismaWithD1 directly in routes.

// Actually, the most robust way without top-level await issues is to provide a proxy 
// that ensures the client is ready.

export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop, receiver) {
    if (prop === "then") return undefined;

    // Use a pre-initialized global if available
    if (globalForPrisma.prisma) {
      return Reflect.get(globalForPrisma.prisma, prop, receiver);
    }

    // On local dev, we can just initialize synchronously
    if (process.env.NODE_ENV === "development" || !process.env.NEXT_RUNTIME) {
       const p = new PrismaClient();
       globalForPrisma.prisma = p;
       return Reflect.get(p, prop, receiver);
    }

    // On Cloudflare, we have a problem here if we haven't initialized yet.
    // However, OpenNext runs everything in a context where we can actually 
    // try to get the binding from globalThis as a last resort.
    const d1 = (globalThis as any).DB || (process.env as any).DB;
    if (d1) {
       const adapter = new PrismaD1(d1);
       const p = new PrismaClient({ adapter } as any);
       globalForPrisma.prisma = p;
       return Reflect.get(p, prop, receiver);
    }

    throw new Error(`Prisma client not initialized and D1 binding 'DB' not found. Mode: ${process.env.NODE_ENV}, Runtime: ${process.env.NEXT_RUNTIME}`);
  }
});

/**
 * Factory for Cloudflare Workers: pass in the D1 binding from the request env.
 */
export async function getPrismaWithD1(d1: any) {
  const adapter = new PrismaD1(d1);
  return new PrismaClient({ adapter } as any);
}
