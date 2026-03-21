"use client";

import { useEffect, useState } from "react";

type TeamMember = {
  id: string;
  user: { id: string; email: string; name: string | null; role: string };
};

type Team = {
  id: string;
  name: string;
  projectName: string | null;
  maxMembers: number;
};

type AvailableTeam = {
  id: string;
  name: string;
  maxMembers: number;
  memberCount: number;
  members: { id: string; name: string | null; email: string }[];
};

export default function TeamActivityClient() {
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [availableTeams, setAvailableTeams] = useState<AvailableTeam[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [miniGroupName, setMiniGroupName] = useState("");
  const [miniGroupEmails, setMiniGroupEmails] = useState("");

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const overviewRes = await fetch("/api/student/overview");
      const overviewData = await overviewRes.json().catch(() => ({}));
      if (!overviewRes.ok) throw new Error(overviewData?.error ?? "Teamstatus konnte nicht geladen werden.");

      const nextTeam = (overviewData?.team ?? null) as Team | null;
      const nextMembers = (overviewData?.members ?? []) as TeamMember[];
      setTeam(nextTeam);
      setMembers(nextMembers);

      if (!nextTeam) {
        const availableRes = await fetch("/api/student/available-teams");
        const availableData = await availableRes.json().catch(() => ({}));
        if (!availableRes.ok) throw new Error(availableData?.error ?? "Verfügbare Teams konnten nicht geladen werden.");
        setAvailableTeams((availableData?.teams ?? []) as AvailableTeam[]);
      } else {
        setAvailableTeams([]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unbekannter Fehler");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function joinTeam(teamId: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/student/join-team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Beitritt fehlgeschlagen.");
      await loadData();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unbekannter Fehler");
      setLoading(false);
    }
  }

  async function createSingleTeam() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/student/create-single-team", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Einzelteam konnte nicht erstellt werden.");
      await loadData();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unbekannter Fehler");
      setLoading(false);
    }
  }

  async function leaveTeam() {
    const ok = window.confirm(
      "Team wirklich verlassen? Danach kannst du dich neu zuordnen (Einzelteam, MiniGruppe, anderem Team beitreten).",
    );
    if (!ok) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/student/leave-team", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Team konnte nicht verlassen werden.");
      await loadData();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unbekannter Fehler");
      setLoading(false);
    }
  }

  async function createMiniGroup() {
    setLoading(true);
    setError(null);
    try {
      const memberEmails = miniGroupEmails
        .split(/[,\n;]+/g)
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
      const res = await fetch("/api/student/create-mini-group", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: miniGroupName, memberEmails }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "MiniGruppe konnte nicht erstellt werden.");
      setMiniGroupName("");
      setMiniGroupEmails("");
      await loadData();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unbekannter Fehler");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {team ? (
        <>
          <div className="rounded-2xl border border-amber-200/60 bg-amber-50/50 backdrop-blur-md p-6 shadow-sm dark:border-amber-900/50 dark:bg-amber-900/20">
            <div className="text-sm font-semibold text-amber-900 dark:text-amber-300">Gruppenfindung / Zuordnung ändern</div>
            <p className="mt-1 text-sm text-amber-900/80 dark:text-amber-300/80">
              Du bist bereits einem Team zugeordnet. Verlasse es, um das Zuordnungs-Tool wieder zu nutzen.
            </p>
            <button
              type="button"
              disabled={loading}
              onClick={leaveTeam}
              className="mt-3 rounded border border-amber-700 bg-white px-3 py-2 text-sm font-medium text-amber-900 hover:bg-amber-100 disabled:opacity-50 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-300 dark:hover:bg-amber-900"
            >
              Team verlassen
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200/60 bg-white/50 backdrop-blur-md p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/50">
            <div className="text-sm text-gray-500 dark:text-slate-400">Team</div>
            <div className="mt-1 font-semibold dark:text-slate-100">{team.name}</div>
            {team.projectName ? <div className="mt-1 text-sm text-gray-700 dark:text-slate-300">Projekt: {team.projectName}</div> : null}
            <div className="mt-2 text-sm text-gray-700 dark:text-slate-300">
              Mitglieder: {members.length} / {team.maxMembers}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/60 bg-white/50 backdrop-blur-md p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/50">
            <div className="text-sm font-semibold dark:text-slate-100">Mitglieder</div>
            <ul className="mt-2 space-y-2 text-sm">
              {members.map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-3">
                  <span className="dark:text-slate-100">
                    {m.user.name ?? m.user.email} <span className="text-gray-500 dark:text-slate-400">({m.user.email})</span>
                  </span>
                  <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700 dark:bg-slate-800 dark:text-slate-300">{m.user.role}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200/60 bg-white/50 backdrop-blur-md p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/50">
            <h3 className="font-semibold dark:text-slate-100">Zuordnung starten</h3>
            <p className="mt-1 text-sm text-gray-700 dark:text-slate-400">Wähle: Einzelteam, MiniGruppe oder bestehendem Team beitreten.</p>
            <div className="mt-3">
              <button
                type="button"
                disabled={loading}
                onClick={createSingleTeam}
                className="rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-blue-500"
              >
                Einzelteam erstellen
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/60 bg-white/50 backdrop-blur-md p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/50">
            <h3 className="font-semibold dark:text-slate-100">MiniGruppe erstellen (2-5)</h3>
            <div className="mt-3 space-y-2">
              <input
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm placeholder-slate-400 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-100"
                placeholder="Gruppenname"
                value={miniGroupName}
                onChange={(e) => setMiniGroupName(e.target.value)}
              />
              <textarea
                className="min-h-[90px] w-full rounded border border-slate-300 px-3 py-2 text-sm placeholder-slate-400 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-100"
                placeholder="Weitere E-Mails (Komma oder Zeilenumbruch)"
                value={miniGroupEmails}
                onChange={(e) => setMiniGroupEmails(e.target.value)}
              />
              <button
                type="button"
                disabled={loading || !miniGroupName.trim()}
                onClick={createMiniGroup}
                className="rounded border border-slate-300 px-3 py-2 text-sm font-medium disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                MiniGruppe anlegen
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/60 bg-white/50 backdrop-blur-md p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/50">
            <h3 className="font-semibold dark:text-slate-100">Bestehendem Team beitreten</h3>
            {availableTeams.length === 0 ? (
              <div className="mt-3 text-sm text-gray-700 dark:text-slate-400">Derzeit sind keine offenen Teams verfügbar.</div>
            ) : (
              <div className="mt-3 space-y-2">
                {availableTeams.map((t) => (
                  <div key={t.id} className="flex flex-wrap items-start justify-between gap-3 rounded border border-slate-200 p-3 dark:border-slate-700 dark:bg-slate-800/50">
                    <div>
                      <div className="font-medium dark:text-slate-100">{t.name}</div>
                      <div className="text-xs text-gray-500 dark:text-slate-400">
                        Mitglieder: {t.memberCount} / {t.maxMembers}
                      </div>
                      <div className="mt-1 text-xs text-gray-600 dark:text-slate-400">
                        {t.members.map((m) => m.name ?? m.email).join(", ")}
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => joinTeam(t.id)}
                      className="rounded border border-slate-300 px-3 py-1 text-xs font-medium disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      Beitreten
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {loading ? <div className="text-sm text-gray-700 dark:text-slate-400">Lade...</div> : null}
      {error ? <div className="text-sm text-red-600 dark:text-red-400">{error}</div> : null}
    </div>
  );
}
