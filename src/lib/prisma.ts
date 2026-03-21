import { PrismaClient } from "@prisma/client";

// PrismaClient is expensive; we keep one instance in dev.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  // In Cloudflare Workers environment, the D1 binding is injected via the request context.
  // We export a factory so API routes can pass the D1 binding when available.
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Factory for Cloudflare Workers: pass in the D1 binding from the request env
export async function getPrismaWithD1(d1: import("@cloudflare/workers-types").D1Database) {
  const { PrismaD1 } = await import("@prisma/adapter-d1");
  const adapter = new PrismaD1(d1);
  return new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);
}
