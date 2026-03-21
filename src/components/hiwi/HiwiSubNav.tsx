"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/hiwi", label: "Dashboard", match: (p: string) => p === "/hiwi" },
  { href: "/hiwi/grading", label: "Bewertungen", match: (p: string) => p.startsWith("/hiwi/grading") },
  { href: "/hiwi/todos", label: "Meine ToDos", match: (p: string) => p.startsWith("/hiwi/todos") },
  { href: "/hiwi/activities", label: "Aktivitäten", match: (p: string) => p.startsWith("/hiwi/activities") },
];

export default function HiwiSubNav() {
  const pathname = usePathname() ?? "";

  return (
    <nav
      className="flex flex-wrap gap-2 rounded-lg border border-slate-200 bg-slate-50/90 p-2 text-sm shadow-sm dark:border-gray-800 dark:bg-gray-900/90"
      aria-label="Hiwi-Bereich"
    >
      {links.map((l) => {
        const active = l.match(pathname);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`rounded-md px-3 py-2 font-medium transition-colors ${
              active 
                ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200 dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-700" 
                : "text-slate-600 hover:bg-white/80 hover:text-slate-900 dark:text-gray-400 dark:hover:bg-gray-800/80 dark:hover:text-gray-100"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
