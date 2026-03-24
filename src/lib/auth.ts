import Credentials from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import type { AppRole } from "@/types/next-auth";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "E-Mail", type: "email" },
        password: { label: "Passwort", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase();
        const password = credentials?.password;
        if (!email || !password) return null;


        const user = await prisma.user.findUnique({
          where: { email },
        });
        if (!user) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as AppRole,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // On initial sign-in, `user` is available — sub/id explizit setzen (verhindert leere Sessions beim Seitenwechsel).
      if (user) {
        const u = user as { id?: string; role?: AppRole };
        if (u.id) token.sub = u.id;
        if (u.role) token.role = u.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) session.user.id = token.sub;
      if (session.user && token.role) session.user.role = token.role as AppRole;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Helper: NextAuth() expects a constant options object.
export const handler = NextAuth(authOptions);

