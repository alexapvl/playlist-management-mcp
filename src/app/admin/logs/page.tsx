"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

// Define the Log type to match our backend
type Log = {
  id: string;
  timestamp: string;
  userId: string;
  actionType: string;
  entityType: string;
  entityId: string;
  details?: string;
  user: {
    id: string;
    name?: string;
    email: string;
    role: string;
  };
};

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "ADMIN")) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch("/api/admin/logs");

        if (!response.ok) {
          throw new Error("Failed to fetch logs");
        }

        const data = await response.json();
        setLogs(data);
      } catch (err) {
        console.error("Error fetching logs:", err);
        setError("Failed to load logs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === "ADMIN") {
      fetchLogs();
    }
  }, [user]);

  // If still checking authentication or not an admin, show loading
  if (isLoading || !user || user.role !== "ADMIN") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-700 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">
        System Activity Logs
      </h1>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-lg text-gray-700 dark:text-gray-300">
            Loading logs...
          </span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="py-3 px-4 text-left text-gray-600 dark:text-gray-200">
                  Timestamp
                </th>
                <th className="py-3 px-4 text-left text-gray-600 dark:text-gray-200">
                  User
                </th>
                <th className="py-3 px-4 text-left text-gray-600 dark:text-gray-200">
                  Action
                </th>
                <th className="py-3 px-4 text-left text-gray-600 dark:text-gray-200">
                  Entity
                </th>
                <th className="py-3 px-4 text-left text-gray-600 dark:text-gray-200">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {logs.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-4 px-4 text-center text-gray-500 dark:text-gray-400"
                  >
                    No logs found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="py-3 px-4 text-gray-800 dark:text-gray-200">
                      {format(new Date(log.timestamp), "MMM d, yyyy HH:mm:ss")}
                    </td>
                    <td className="py-3 px-4 text-gray-800 dark:text-gray-200">
                      {log.user ? (
                        <>
                          {log.user.name || log.user.email || "Anonymous"}
                          {log.user.role === "ADMIN" && (
                            <span className="ml-2 text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 px-2 py-1 rounded">
                              Admin
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-gray-500">Anonymous</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          log.actionType === "CREATE"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : log.actionType === "READ"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            : log.actionType === "UPDATE"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                      >
                        {log.actionType}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-gray-800 dark:text-gray-200">
                        {log.entityType}
                      </span>
                      <span className="block text-xs text-gray-500 dark:text-gray-400">
                        ID: {log.entityId}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-800 dark:text-gray-200">
                      {log.details || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
