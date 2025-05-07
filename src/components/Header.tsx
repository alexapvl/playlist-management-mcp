"use client";

import { useAuth } from "@/context/auth-context";
import Link from "next/link";

export default function Header() {
  const { user, logout, isLoading } = useAuth();

  return (
    <header className="bg-white dark:bg-gray-800 shadow">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link
          href="/"
          className="text-xl font-bold text-gray-800 dark:text-white"
        >
          Playlist Manager
        </Link>

        <div className="flex items-center space-x-4">
          {isLoading ? (
            <div className="text-sm text-gray-500">Loading...</div>
          ) : user ? (
            <>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {user.role === "ADMIN" ? "👑 " : ""}
                {user.name || user.email}
              </span>
              {user.role === "ADMIN" && (
                <Link
                  href="/admin/logs"
                  className="text-sm px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                >
                  Activity Logs
                </Link>
              )}
              <button
                onClick={() => logout()}
                className="text-sm px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/auth"
              className="text-sm px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
            >
              Login / Register
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
