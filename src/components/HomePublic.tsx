import Link from "next/link";

export default function HomePublic() {
  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-2xl font-bold dark:text-slate-100">TPSE Orga-Plattform</h1>
        <p className="text-sm text-gray-700 dark:text-slate-400">
          Teamverwaltung, Abgaben, Bewertung, Termine und Ressourcen – alles an einem Ort.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200/60 bg-white/50 backdrop-blur-md p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/50">
          <h2 className="font-semibold dark:text-slate-100">Für Studierende</h2>
          <p className="mt-1 text-sm text-gray-700 dark:text-slate-400">Team & Abgaben verwalten, Feedback abrufen.</p>
          <div className="mt-3">
            <Link className="text-sm underline hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300" href="/login">
              Los geht’s
            </Link>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200/60 bg-white/50 backdrop-blur-md p-6 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/50">
          <h2 className="font-semibold dark:text-slate-100">Für HiWis/Admins</h2>
          <p className="mt-1 text-sm text-gray-700 dark:text-slate-400">Teams betreuen, bewerten, kommunizieren.</p>
          <div className="mt-3">
            <Link className="text-sm underline hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300" href="/login">
              Dashboard öffnen
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
