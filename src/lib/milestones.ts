/**
 * Pflicht-Meilensteine für Studierende: Fristen via Umgebungsvariablen (ISO 8601).
 * Wenn eine Variable fehlt oder ungültig ist, gilt die Frist als „nicht gesetzt“ (UI-Hinweis).
 */

export const MILESTONE_ENV = {
  JOIN: "MILESTONE_DEADLINE_JOIN",
  PROJECT_PREFERENCES: "MILESTONE_DEADLINE_PROJECT_PREFERENCES",
  SPEC: "MILESTONE_DEADLINE_SPEC",
} as const;

export type MilestoneKey = "JOIN_TEAM" | "PROJECT_PREFERENCES" | "SPEC_UPLOAD";

export function parseDeadlineFromEnv(name: string): Date | null {
  const raw = process.env[name]?.trim();
  if (!raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

export function daysUntil(deadline: Date | null): number | null {
  if (!deadline) return null;
  const ms = deadline.getTime() - Date.now();
  return Math.ceil(ms / 86400000);
}

export function isOverdue(deadline: Date | null, done: boolean): boolean {
  if (!deadline || done) return false;
  return deadline.getTime() < Date.now();
}

export function isUrgent(deadline: Date | null, done: boolean, urgentWithinDays = 7): boolean {
  if (!deadline || done) return false;
  const d = daysUntil(deadline);
  return d !== null && d >= 0 && d <= urgentWithinDays;
}
