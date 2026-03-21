"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/hiwi", label: "Dashboard", match: (p: string) => p === "/hiwi" },
  { href: "/hiwi/grading", label: "Bewertungen", match: (p: string) => p.startsWith("/hiwi/grading") },
  { href: "/hiwi/specs", label: "Spezifikationen", match: (p: string) => p.startsWith("/hiwi/specs") },
  { href: "/hiwi/assignments", label: "Aufgaben", match: (p: string) => p.startsWith("/hiwi/assignments") },
  { href: "/hiwi/todos", label: "Meine ToDos", match: (p: string) => p.startsWith("/hiwi/todos") },
  { href: "/hiwi/activities", label: "Aktivitäten", match: (p: string) => p.startsWith("/hiwi/activities") },
];

export default function HiwiSubNav() {
  const pathname = usePathname() ?? "";

  return (
    <nav
      className="flex flex-wrap gap-2 rounded-xl border border-slate-200/60 bg-white/50 backdrop-blur-md p-2 text-sm shadow-sm dark:border-slate-800/60 dark:bg-slate-900/50"
      aria-label="Hiwi-Bereich"
    >
      {links.map((l) => {
        const active = l.match(pathname);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`rounded-lg px-3 py-2 font-medium transition-all duration-200 ${
              active 
                ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/50 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-700/50" 
                : "text-slate-600 hover:bg-slate-100/50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-100"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
