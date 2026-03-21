/**
 * Cloudflare environment bindings exposed to Next.js routes via `getCloudflareContext`
 * from @opennextjs/cloudflare.
 *
 * Usage in API routes:
 *   const { env } = await getCloudflareContext();
 *   const db = await getPrismaWithD1(env.DB);
 *   const bucket = env.PDF_BUCKET;
 */
export interface CloudflareEnv {
  DB: import("@cloudflare/workers-types").D1Database;
  PDF_BUCKET: import("@cloudflare/workers-types").R2Bucket;
}
