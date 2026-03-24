import { PrismaClient } from "@prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";

// Singleton to store the initialized client
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * Internal helper to get/initialize the client.
 * This can be called lazily from a Proxy or directly.
 */
function getClient(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  // Detect Cloudflare D1 binding
  // Note: On Cloudflare Workers with OpenNext, bindings are often on process.env
  const env = process.env as any;
  const d1 = env.DB;
  
  if (d1 && typeof d1.prepare === "function") {
    const adapter = new PrismaD1(d1);
    const p = new PrismaClient({ adapter } as any);
    globalForPrisma.prisma = p;
    return p;
  }

  // Fallback for local development (SQLite)
  // We only reach here if NOT on Cloudflare or if the binding is missing.
  // We check for NEXT_RUNTIME to avoid accidental engine loading on Edge.
  if (env.NEXT_RUNTIME === "edge") {
    throw new Error("Prisma D1 binding 'DB' not found in Edge runtime.");
  }

  const p = new PrismaClient({
    log: env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

  if (env.NODE_ENV !== "production") globalForPrisma.prisma = p;
  return p;
}

/**
 * The 'prisma' constant is a Proxy that lazily initializes the client on first use.
 * This ensures that on Cloudflare, the D1 binding is accessed during a request, 
 * avoiding issues with top-level initialization.
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
