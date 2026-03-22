import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Lazy-loaded upload utilities to avoid loading 'fs' in Cloudflare Edge runtime.
 */

export const getTeamSpecsDir = () => {
  const path = require("path");
  return path.join(process.cwd(), "uploads", "team-specs");
};

export async function ensureTeamSpecsDir() {
  const fs = await import("fs/promises");
  await fs.mkdir(getTeamSpecsDir(), { recursive: true });
}

export function teamSpecFilePath(teamId: string) {
  const path = require("path");
  return path.join(getTeamSpecsDir(), `${teamId}.pdf`);
}

export async function getCfEnv(): Promise<Record<string, any> | null> {
  try {
    const { env } = await getCloudflareContext();
    return (env as Record<string, any>) ?? null;
  } catch {
    return null;
  }
}
