"use client";

import { useEffect, useMemo, useState } from "react";

type TeamMemberDto = {
  id: string;
  user: { id: string; email: string; name: string | null; role: string };
};

type TeamDto = {
  id: string;
  name: string;
  projectName: string | null;
  maxMembers: number;
  members?: TeamMemberDto[];
};

function parseEmails(input: string) {
  return input
    .split(/[,\n;]+/g)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<TeamDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [maxMembers, setMaxMembers] = useState<number>(5);
  const [memberEmailsInput, setMemberEmailsInput] = useState("");

  const memberEmails = useMemo(() => parseEmails(memberEmailsInput), [memberEmailsInput]);

  async function loadTeams() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/teams");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Fehler beim Laden der Teams");
      setTeams(data.teams ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unbekannter Fehler");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTeams();
  }, []);

  function resetForm() {
    setSelectedId(null);
    setName("");
    setProjectName("");
    setMaxMembers(5);
    setMemberEmailsInput("");
  }

  function startEdit(team: TeamDto) {
    setSelectedId(team.id);
    setName(team.name);
    setProjectName(team.projectName ?? "");
    setMaxMembers(team.maxMembers ?? 5);
    setMemberEmailsInput((team.members ?? []).map((m) => m.user.email).join(", "));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const payload = {
      name,
      projectName: projectName.trim() ? projectName.trim() : null,
      maxMembers,
      memberEmails,
    };

    try {
      if (!selectedId) {
        const res = await fetch("/api/teams", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error ?? "Fehler beim Erstellen");
      } else {
        const res = await fetch(`/api/teams/${selectedId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error ?? "Fehler beim Aktualisieren");
      }

      resetForm();
      await loadTeams();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unbekannter Fehler");
    } finally {
      setLoading(false);
    }
  }

  async function onDelete(id: string) {
    const ok = window.confirm("Team wirklich löschen? (inkl. Mitglieder)");
    if (!ok) return;

    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/teams/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Fehler beim Löschen");
      if (selectedId === id) resetForm();
      await loadTeams();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unbekannter Fehler");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold">Teams</h1>
        <p className="text-sm text-gray-700">
          Teams erstellen/ändern und Studierende per E-Mail zuordnen.
        </p>
      </div>

      <div className="rounded border bg-white p-4">
        <h2 className="font-semibold">{selectedId ? "Team bearbeiten" : "Neues Team erstellen"}</h2>
        <form className="mt-4 space-y-3" onSubmit={onSubmit}>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm text-gray-700">Teamname</label>
              <input
                className="w-full rounded border px-3 py-2 text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-700">Max. Mitglieder</label>
              <input
                type="number"
                className="w-full rounded border px-3 py-2 text-sm"
                value={maxMembers}
                onChange={(e) => setMaxMembers(Number(e.target.value))}
                min={1}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm text-gray-700">Projektname (optional)</label>
            <input
              className="w-full rounded border px-3 py-2 text-sm"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="z.B. TPSE Projektgruppe"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-gray-700">Mitglieder (E-Mails, Komma-getrennt)</label>
            <textarea
              className="min-h-[88px] w-full rounded border px-3 py-2 text-sm"
              value={memberEmailsInput}
              onChange={(e) => setMemberEmailsInput(e.target.value)}
              placeholder="student1@... , student2@..."
            />
            <div className="text-xs text-gray-500">Wird beim Speichern komplett ersetzt.</div>
          </div>

          {error ? <div className="text-sm text-red-600">{error}</div> : null}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={loading}
              className="rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {loading ? "Speichere..." : selectedId ? "Update" : "Erstellen"}
            </button>
            {selectedId ? (
              <button
                type="button"
                disabled={loading}
                onClick={resetForm}
                className="rounded border px-3 py-2 text-sm font-medium disabled:opacity-50"
              >
                Abbrechen
              </button>
            ) : null}
          </div>
        </form>
      </div>

      <div className="rounded border bg-white p-4">
        <h2 className="font-semibold">Team-Liste</h2>

        {loading ? <div className="mt-3 text-sm text-gray-700">Lade...</div> : null}
        {!loading && teams.length === 0 ? (
          <div className="mt-3 text-sm text-gray-700">Noch keine Teams vorhanden.</div>
        ) : null}

        <div className="mt-4 space-y-3">
          {teams.map((t) => (
            <div key={t.id} className="rounded border p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{t.name}</div>
                  {t.projectName ? <div className="text-sm text-gray-700">{t.projectName}</div> : null}
                  <div className="text-xs text-gray-500">
                    Mitglieder: {t.members?.length ?? 0} / {t.maxMembers}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    className="rounded border px-3 py-1 text-xs font-medium"
                    onClick={() => startEdit(t)}
                  >
                    Bearbeiten
                  </button>
                  <button
                    type="button"
                    className="rounded border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700"
                    onClick={() => onDelete(t.id)}
                  >
                    Löschen
                  </button>
                </div>
              </div>
              {t.members && t.members.length > 0 ? (
                <div className="mt-2 text-xs text-gray-600">
                  {t.members
                    .slice(0, 5)
                    .map((m) => m.user.email)
                    .join(", ")}
                  {t.members.length > 5 ? ` (+${t.members.length - 5} weitere)` : ""}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

