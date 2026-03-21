"use client";

import { useCallback, useEffect, useState } from "react";

type Team = {
  id: string;
  name: string;
  projectName: string | null;
  maxMembers: number;
};

export function useStudentTeam() {
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/student/overview");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Teamstatus konnte nicht geladen werden.");
      setTeam((data?.team ?? null) as Team | null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler");
      setTeam(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { team, hasTeam: !!team, teamId: team?.id ?? null, loading, error, reload };
}
