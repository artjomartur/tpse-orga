"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [inviteToken, setInviteToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name, password, inviteToken }),
    });

    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setError(data?.error ?? "Registrierung fehlgeschlagen");
      return;
    }

    setSuccess("Registrierung erfolgreich. Bitte einloggen.");
  }

  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-2xl font-bold dark:text-slate-100">Registrieren</h1>

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
          <label className="text-sm text-gray-700 dark:text-slate-400" htmlFor="name">
            Name
          </label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm placeholder-slate-400 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-100"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-gray-700 dark:text-slate-400" htmlFor="inviteToken">
            Invite-Token (optional)
          </label>
          <input
            id="inviteToken"
            value={inviteToken}
            onChange={(e) => setInviteToken(e.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm placeholder-slate-400 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-100"
          />
        </div>

        {error ? <div className="text-sm text-red-600 dark:text-red-400">{error}</div> : null}
        {success ? <div className="text-sm text-green-700 dark:text-green-400">{success}</div> : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-blue-500"
        >
          {loading ? "Registriere..." : "Registrieren"}
        </button>

        <p className="text-center text-xs text-gray-600 dark:text-slate-400">
          Schon ein Konto?{" "}
          <Link className="underline hover:text-blue-600 dark:hover:text-blue-400" href="/login">
            Einloggen
          </Link>
        </p>
      </form>
    </div>
  );
}

