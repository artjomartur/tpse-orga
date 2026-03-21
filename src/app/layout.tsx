import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

import type { Metadata, Viewport } from "next";
import Link from "next/link";
import Providers from "./providers";
import { ThemeToggle } from "../components/ThemeToggle";
import { UserNav } from "../components/UserNav";

export const metadata: Metadata = {
  title: "TPSE Orga",
  description: "Organisationplattform für TPSE an der TU Darmstadt",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={inter.className} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col bg-slate-50 text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900 dark:bg-slate-950 dark:text-slate-100 dark:selection:bg-blue-900/50">
        <Providers>
          <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/70 backdrop-blur-md transition-colors dark:border-slate-800/60 dark:bg-slate-950/70">
            <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
              <div className="text-lg font-semibold hover:opacity-80 transition-opacity">
                <Link href="/">TPSE Orga</Link>
              </div>
              <nav className="flex items-center gap-4 text-sm font-medium">
                <UserNav />
                <div className="hidden h-4 w-px bg-slate-200 sm:block dark:bg-slate-800" />
                <ThemeToggle />
              </nav>
            </div>
          </header>
          <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
        </Providers>
      </body>
    </html>
  );
}

