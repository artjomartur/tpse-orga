import { PrismaClient } from "@prisma/client";

// In Cloudflare Workers, we use the D1 adapter. 
// In local dev, we use the standard PrismaClient (SQLite).
// We avoid top-level initialization that might trigger engine loading on Edge.

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * Returns a standard PrismaClient for local development.
 * Lazy initialization avoids engine-probing on Cloudflare.
 */
export function getLocalPrisma() {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;
  
  const p = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
  
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = p;
  return p;
}

// Exported for backward compatibility in some local scripts, 
// but use getDb() or getLocalPrisma() where possible.
export const prisma = getLocalPrisma();

/**
 * Factory for Cloudflare Workers: pass in the D1 binding from the request env.
 * This is the preferred way to get a DB instance in API routes.
 */
export async function getPrismaWithD1(d1: any) {
  const { PrismaD1 } = await import("@prisma/adapter-d1");
  const adapter = new PrismaD1(d1);
  return new PrismaClient({ adapter } as any);
}
