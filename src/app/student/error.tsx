"use client";

import { useEffect } from "react";

/**
 * Fehlergrenze für den Studierenden-Bereich (/student/*).
 * Hilft dem Dev-Overlay, die Route stabil zu kompilieren.
 */
export default function StudentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[student]", error);
  }, [error]);

  return (
    <div className="rounded border border-red-200 bg-red-50 p-6">
      <h2 className="text-lg font-semibold text-red-900">Fehler im Studierenden-Bereich</h2>
      <p className="mt-2 text-sm text-red-800">
        {error.message || "Unbekannter Fehler."}
        {error.digest ? (
          <span className="mt-1 block text-xs text-red-700">Digest: {error.digest}</span>
        ) : null}
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded bg-red-700 px-3 py-2 text-sm font-medium text-white hover:bg-red-800"
        >
          Erneut versuchen
        </button>
        <a
          href="/"
          className="rounded border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-900 hover:bg-red-100"
        >
          Zur Startseite
        </a>
      </div>
    </div>
  );
}
