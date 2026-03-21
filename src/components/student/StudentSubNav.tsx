"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Übersicht", match: (p: string) => p === "/" },
  { href: "/student/team", label: "Gruppenwahl", match: (p: string) => p.startsWith("/student/team") },
  { href: "/student/projects", label: "Projektwahl", match: (p: string) => p.startsWith("/student/projects") },
  { href: "/student/spec", label: "Spezifikation", match: (p: string) => p.startsWith("/student/spec") },
];

export default function StudentSubNav() {
  const pathname = usePathname() ?? "";

  return (
    <nav
      className="flex flex-wrap gap-2 rounded-lg border border-slate-200 bg-slate-50/90 p-2 text-sm shadow-sm"
      aria-label="Studierenden-Bereich"
    >
      {links.map((l) => {
        const active = l.match(pathname);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`rounded-md px-3 py-2 font-medium transition-colors ${
              active ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200" : "text-slate-600 hover:bg-white/80 hover:text-slate-900"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
