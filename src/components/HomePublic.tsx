import Link from "next/link";

export default function HomePublic() {
  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-2xl font-bold">TPSE Orga-Plattform</h1>
        <p className="text-sm text-gray-700">
          Teamverwaltung, Abgaben, Bewertung, Termine und Ressourcen – alles an einem Ort.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded border bg-white p-4">
          <h2 className="font-semibold">Für Studierende</h2>
          <p className="mt-1 text-sm text-gray-700">Team & Abgaben verwalten, Feedback abrufen.</p>
          <div className="mt-3">
            <Link className="text-sm underline" href="/login">
              Los geht’s
            </Link>
          </div>
        </div>
        <div className="rounded border bg-white p-4">
          <h2 className="font-semibold">Für HiWis/Admins</h2>
          <p className="mt-1 text-sm text-gray-700">Teams betreuen, bewerten, kommunizieren.</p>
          <div className="mt-3">
            <Link className="text-sm underline" href="/login">
              Dashboard öffnen
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
