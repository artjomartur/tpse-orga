import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

import type { AppRole } from "@/types/next-auth";

const hiwiRoutes = ["/dashboard", "/teams", "/submissions", "/grading", "/users"];
const studentRoutes = ["/my-team", "/my-submissions", "/my-grades"];

function matchesAnyRoute(pathname: string, routes: string[]) {
  return routes.some((r) => pathname === r || pathname.startsWith(`${r}/`));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip Next.js internals and public routes.
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/" ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    const redirectUrl = new URL("/login", req.url);
    redirectUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  const role = token.role as AppRole | undefined;
  if (!role) return NextResponse.redirect(new URL("/login", req.url));

  if (matchesAnyRoute(pathname, studentRoutes) && role !== "STUDENT") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (matchesAnyRoute(pathname, hiwiRoutes) && role !== "HIWI" && role !== "ADMIN") {
    // Avoid infinite redirect loops for STUDENT users.
    if (role === "STUDENT") return NextResponse.redirect(new URL("/my-team", req.url));
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

