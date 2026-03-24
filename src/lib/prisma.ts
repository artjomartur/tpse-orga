import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * Returns a standard PrismaClient for local development or Cloudflare D1 in production.
 */
export async function getLocalPrisma() {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  const d1 = (process.env as any).DB;
  
  if (d1 && typeof d1.prepare === "function") {
    console.log("Using Cloudflare D1 adapter for Prisma");
    try {
      const { PrismaD1 } = await import("@prisma/adapter-d1");
      const adapter = new PrismaD1(d1);
      const p = new PrismaClient({ adapter } as any);
      globalForPrisma.prisma = p;
      return p;
    } catch (e) {
      console.error("Failed to load Prisma D1 adapter:", e);
    }
  }

  const p = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = p;
  return p;
}

/**
 * Proxy object to ensure that any access to 'prisma' triggers the correct initialization.
 * This handles the transition from synchronous local dev to asynchronous D1 initialization.
 * Note: In API routes, 'await prisma...' or similar will work if we use a proxy that handles the client.
 * Actually, for simplicity in a system where imports are synchronous, we'll keep the constant 
 * but routes should ideally use await getLocalPrisma().
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop, receiver) {
    if (prop === "then") return undefined; // Avoid being treated as a thenable
    
    // This is tricky for a singleton constant. 
    // Most routes do: await prisma.user.findMany()
    // which effectively calls prisma.user, then result.findMany.
    
    // We'll return the global instance if it exists, otherwise we'll throw 
    // or try to initialize (but we can't 'await' here).
    
    if (globalForPrisma.prisma) {
      return Reflect.get(globalForPrisma.prisma, prop, receiver);
    }
    
    // If not initialized yet, we return the base client (SQLite) 
    // and hope for the best, or initialize it synchronously if it's NOT D1.
    const p = new PrismaClient();
    globalForPrisma.prisma = p;
    return Reflect.get(p, prop, receiver);
  }
});

/**
 * Factory for Cloudflare Workers: pass in the D1 binding from the request env.
 * This is the preferred way to get a DB instance in API routes.
 */
export async function getPrismaWithD1(d1: any) {
  const { PrismaD1 } = await import("@prisma/adapter-d1");
  const adapter = new PrismaD1(d1);
  return new PrismaClient({ adapter } as any);
}
