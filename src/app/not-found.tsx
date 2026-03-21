import Link from "next/link";

export default function NotFound() {
  return (
    <div className="rounded border bg-white p-8 text-center">
      <h1 className="text-2xl font-bold text-gray-900">Seite nicht gefunden</h1>
      <p className="mt-2 text-sm text-gray-700">Die angeforderte URL existiert nicht.</p>
      <Link href="/" className="mt-6 inline-block text-sm font-medium text-blue-600 underline">
        Zur Startseite
      </Link>
    </div>
  );
}
