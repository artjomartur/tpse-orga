import fs from "fs/promises";
import path from "path";

export const TEAM_SPECS_DIR = path.join(process.cwd(), "uploads", "team-specs");

export async function ensureTeamSpecsDir() {
  await fs.mkdir(TEAM_SPECS_DIR, { recursive: true });
}

export function teamSpecFilePath(teamId: string) {
  return path.join(TEAM_SPECS_DIR, `${teamId}.pdf`);
}
