import { getServerSession } from "next-auth/next";

import { authOptions } from "@/lib/auth";
import type { AppRole } from "@/types/next-auth";

export async function getCurrentRole(): Promise<AppRole | null> {
  const session = await getServerSession(authOptions);
  return (session?.user?.role as AppRole) ?? null;
}

