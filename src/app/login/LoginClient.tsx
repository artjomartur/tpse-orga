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

  async function loginAs(roleEmail: string, pass: string) {
    setError(null);
    setLoading(true);
    const result = await signIn("credentials", {
      email: roleEmail,
      password: pass,
      redirect: false,
    });
    setLoading(false);

    if (!result?.ok) {
      setError(result?.error ?? "Demo login failed");
      return;
    }

    router.refresh();
    const session = await getSession();
    const role = session?.user?.role as AppRole | undefined;
    const path = parseCallbackPath(callbackUrl);

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
    <div className="mx-auto max-w-md space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-3xl font-bold dark:text-slate-100">Login</h1>
        <p className="text-sm text-slate-500">Bitte anmelden oder Demo-Account wählen</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => loginAs("anna@test.com", "test")}
          disabled={loading}
          className="flex flex-col items-center justify-center rounded-2xl border border-slate-200/60 bg-white/50 p-6 shadow-sm backdrop-blur-md transition-all hover:bg-white hover:shadow-md dark:border-slate-800/60 dark:bg-slate-900/50 dark:hover:bg-slate-900"
        >
          <span className="text-2xl mb-1">🎓</span>
          <span className="text-sm font-semibold dark:text-slate-100">Student</span>
          <span className="text-[10px] text-slate-500">Demo Anna</span>
        </button>

        <button
          onClick={() => loginAs("admin@test.com", "test")}
          disabled={loading}
          className="flex flex-col items-center justify-center rounded-2xl border border-slate-200/60 bg-white/50 p-6 shadow-sm backdrop-blur-md transition-all hover:bg-white hover:shadow-md dark:border-slate-800/60 dark:bg-slate-900/50 dark:hover:bg-slate-900"
        >
          <span className="text-2xl mb-1">⚙️</span>
          <span className="text-sm font-semibold dark:text-slate-100">Admin</span>
          <span className="text-[10px] text-slate-500">Demo Admin</span>
        </button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-slate-50 px-2 text-slate-500 dark:bg-slate-950">oder mit Account</span>
        </div>
      </div>

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
            placeholder="name@beispiel.de"
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
          className="w-full rounded bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-indigo-700 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
        >
          {loading ? "Prüfe..." : "Anmelden"}
        </button>
      </form>
    </div>
  );
}

