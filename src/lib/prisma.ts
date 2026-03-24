import { PrismaClient } from "@prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * Returns a standard PrismaClient for local development or Cloudflare D1 in production.
 */
function createPrismaClient() {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  const d1 = (process.env as any).DB;
  
  if (d1 && typeof d1.prepare === "function") {
    // Cloudflare environment detected
    const adapter = new PrismaD1(d1);
    const p = new PrismaClient({ adapter } as any);
    globalForPrisma.prisma = p;
    return p;
  }

  // Local development (SQLite)
  const p = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = p;
  return p;
}

// Exported constant used by most routes. 
// It will be initialized on first access.
export const prisma = createPrismaClient();

/**
 * Helper to ensure we have a client (redundant now but kept for compatibility)
 */
export async function getLocalPrisma() {
  return createPrismaClient();
}

/**
 * Factory for Cloudflare Workers: pass in the D1 binding from the request env.
 * This is the preferred way to get a DB instance in API routes.
 */
export async function getPrismaWithD1(d1: any) {
  const adapter = new PrismaD1(d1);
  return new PrismaClient({ adapter } as any);
}
