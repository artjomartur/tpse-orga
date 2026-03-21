"use client";

/**
 * Wird bei Fehlern im Root-Layout gerendert — muss eigenes <html>/<body> haben.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="de">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#fef2f2", color: "#7f1d1d", padding: 24 }}>
        <h1 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Kritischer Fehler</h1>
        <p style={{ marginTop: 8, fontSize: "0.875rem" }}>{error.message || "Die Anwendung konnte nicht geladen werden."}</p>
        <button
          type="button"
          onClick={() => reset()}
          style={{
            marginTop: 16,
            padding: "8px 16px",
            borderRadius: 6,
            border: "none",
            background: "#b91c1c",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Neu laden
        </button>
      </body>
    </html>
  );
}
