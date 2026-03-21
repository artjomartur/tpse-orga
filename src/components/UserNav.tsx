"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export function UserNav() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <span className="text-gray-400">...</span>;
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {session.user.name || session.user.email}
        </span>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-red-600 hover:text-red-700 hover:underline dark:text-red-400 dark:hover:text-red-300"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <>
      <Link className="hover:underline dark:text-gray-300" href="/login">
        Login
      </Link>
      <Link className="hover:underline dark:text-gray-300" href="/register">
        Register
      </Link>
    </>
  );
}
