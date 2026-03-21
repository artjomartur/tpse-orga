"use client";

import { FormEvent, useState } from "react";
import { getSession, signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

import { isHiwiOnlyPath, parseCallbackPath } from "@/lib/route-role";
import type { AppRole } from "@/types/next-auth";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (!result?.ok) {
      setError(result?.error ?? "Login fehlgeschlagen");
      return;
    }

    // Server-Komponenten aktualisieren (Session für RSC)
    router.refresh();

    // Session explizit lesen — sonst kann die nächste Navigation noch ohne Rolle sein.
    const session = await getSession();
    const role = session?.user?.role as AppRole | undefined;
    const path = parseCallbackPath(callbackUrl);

    // Voller Seitenwechsel: Cookie/Session zuverlässig für getServerSession auf "/"
    let target = "/dashboard";
    if (role === "STUDENT") {
      if (!path || path === "/login" || path === "/dashboard" || isHiwiOnlyPath(path)) {
        target = "/";
      } else {
        target = path;
      }
    } else {
      if (!path || path === "/login" || path === "/") {
        target = "/dashboard";
      } else {
        target = path;
      }
    }

    window.location.assign(target);
  }

  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-2xl font-bold dark:text-slate-100">Login</h1>

      <form className="space-y-3 rounded-2xl border border-slate-200/60 bg-white/50 backdrop-blur-md p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/50" onSubmit={onSubmit}>
        <div className="space-y-1">
          <label className="text-sm text-gray-700 dark:text-slate-400" htmlFor="email">
            E-Mail
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm placeholder-slate-400 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-100"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-gray-700 dark:text-slate-400" htmlFor="password">
            Passwort
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm placeholder-slate-400 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-100"
            required
          />
        </div>

        {error ? <div className="text-sm text-red-600 dark:text-red-400">{error}</div> : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-blue-500"
        >
          {loading ? "Prüfe..." : "Anmelden"}
        </button>
      </form>
    </div>
  );
}

