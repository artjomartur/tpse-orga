import "./globals.css";

import type { Metadata } from "next";
import Link from "next/link";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "TPSE Orga",
  description: "Organisationplattform für TPSE an der TU Darmstadt",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <head>
        {/* Minimaler Fallback, falls /_next/static CSS-Chunks nicht laden (kaputter .next Cache) */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              body { margin: 0; font-family: system-ui, -apple-system, Segoe UI, sans-serif; background: #f9fafb; color: #111827; }
              a { color: #2563eb; }
            `,
          }}
        />
      </head>
      <body>
        <Providers>
          <header className="border-b bg-white">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
              <div className="font-semibold">
                <Link href="/">TPSE Orga</Link>
              </div>
              <nav className="flex gap-3 text-sm">
                <Link className="hover:underline" href="/login">
                  Login
                </Link>
                <Link className="hover:underline" href="/register">
                  Register
                </Link>
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
        </Providers>
      </body>
    </html>
  );
}

