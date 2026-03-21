/**
 * Pfade, die nur HiWi/Admin betreffen (Middleware leitet Studierende auf "/" um).
 */
const HIWI_PATH_PREFIXES = ["/dashboard", "/teams", "/submissions", "/grading", "/users"];

export function parseCallbackPath(callbackUrl: string | null | undefined): string {
  if (!callbackUrl?.trim()) return "";
  const raw = callbackUrl.trim();
  try {
    if (raw.startsWith("/")) {
      const q = raw.indexOf("?");
      return q === -1 ? raw : raw.slice(0, q);
    }
    const u = new URL(raw);
    return u.pathname || "";
  } catch {
    return "";
  }
}

export function isHiwiOnlyPath(pathname: string): boolean {
  return HIWI_PATH_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}
