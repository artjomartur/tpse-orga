import { PrismaClient } from "@prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";

// Singleton to store the initialized client
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * Internal helper to get/initialize the client.
 */
function getClient(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  const env = process.env as any;
  // Check both process.env and globalThis for the D1 binding
  const d1 = env.DB || (globalThis as any).DB;
  
  const isEdge = env.NEXT_RUNTIME === "edge" || typeof (globalThis as any).WebSocketPair !== "undefined";

  if (d1 && typeof d1.prepare === "function") {
    const adapter = new PrismaD1(d1);
    const p = new PrismaClient({ adapter } as any);
    globalForPrisma.prisma = p;
    return p;
  }

  // If we are on Edge/Cloudflare but the binding is missing, we MUST NOT 
  // initialize the standard PrismaClient as it will cause the 'fs.readdir' error.
  if (isEdge) {
    console.error("D1 binding 'DB' not found! process.env.DB:", !!env.DB, "globalThis.DB:", !!(globalThis as any).DB);
    // Return a dummy client or throw an informative error that doesn't trigger fs.readdir
    throw new Error("Critical: D1 Database binding 'DB' is missing in the Cloudflare environment.");
  }

  // Local development (SQLite)
  const p = new PrismaClient({
    log: env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

  if (env.NODE_ENV !== "production") globalForPrisma.prisma = p;
  return p;
}

/**
 * The 'prisma' constant is a Proxy that lazily initializes the client on first use.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop, receiver) {
    if (prop === "then") return undefined;
    const client = getClient();
    return Reflect.get(client, prop, receiver);
  }
});

/**
 * Backward compatibility helper
 */
export async function getLocalPrisma() {
  return getClient();
}

/**
 * Factory for Cloudflare Workers: pass in the D1 binding from the request env.
 */
export async function getPrismaWithD1(d1: any) {
  const adapter = new PrismaD1(d1);
  return new PrismaClient({ adapter } as any);
}
