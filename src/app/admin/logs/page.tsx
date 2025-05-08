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

type SortField = "timestamp" | "user" | "actionType" | "entityType";
type SortDirection = "asc" | "desc";

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("timestamp");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [actionTypeFilter, setActionTypeFilter] = useState<string>("all");
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>("all");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
  });
  const [enumValues, setEnumValues] = useState({
    actionTypes: [] as string[],
    entityTypes: [] as string[],
  });
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "ADMIN")) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  // Function to fetch enum values
  const fetchEnumValues = async () => {
    if (!user || user.role !== "ADMIN") return;

    try {
      const response = await fetch("/api/admin/logs?metadata=true");

      if (!response.ok) {
        throw new Error("Failed to fetch metadata");
      }

      const data = await response.json();
      setEnumValues({
        actionTypes: data.actionTypes || [],
        entityTypes: data.entityTypes || [],
      });
    } catch (err) {
      console.error("Error fetching enum values:", err);
    }
  };

  useEffect(() => {
    fetchEnumValues();
  }, [user]);

  // Function to fetch the total count
  const fetchTotalCount = async () => {
    if (!user || user.role !== "ADMIN") return;

    try {
      // Build query parameters for count
      const queryParams = new URLSearchParams();
      queryParams.append("countOnly", "true");

      // Add filters if they are not "all"
      if (entityTypeFilter !== "all") {
        queryParams.append("entityType", entityTypeFilter);
      }

      if (actionTypeFilter !== "all") {
        queryParams.append("actionType", actionTypeFilter);
      }

      const response = await fetch(`/api/admin/logs?${queryParams.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch log count");
      }

      const data = await response.json();

      // Update pagination with accurate count
      setPagination((prev) => ({
        ...prev,
        totalItems: data.count,
        totalPages: Math.ceil(data.count / prev.itemsPerPage),
      }));
    } catch (err) {
      console.error("Error fetching log count:", err);
    }
  };

  const fetchLogs = async () => {
    if (!user || user.role !== "ADMIN") return;

    setLoading(true);
    setError(null);

    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      const offset = (pagination.currentPage - 1) * pagination.itemsPerPage;

      // Add pagination parameters
      queryParams.append("limit", pagination.itemsPerPage.toString());
      queryParams.append("offset", offset.toString());

      // Add filters if they are not "all"
      if (entityTypeFilter !== "all") {
        queryParams.append("entityType", entityTypeFilter);
      }

      if (actionTypeFilter !== "all") {
        queryParams.append("actionType", actionTypeFilter);
      }

      // Add sorting parameters
      queryParams.append("sortField", sortField);
      queryParams.append("sortDirection", sortDirection);

      console.log("Fetching logs with params:", queryParams.toString());

      const response = await fetch(`/api/admin/logs?${queryParams.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch logs");
      }

      const data = await response.json();
      console.log("Received logs:", data.length);
      setLogs(data);

      // Also fetch the total count to update pagination
      await fetchTotalCount();
    } catch (err) {
      console.error("Error fetching logs:", err);
      setError("Failed to load logs. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // When filters change, reset to page 1
  useEffect(() => {
    if (user && user.role === "ADMIN") {
      // Reset to page 1 when filters change
      setPagination((prev) => ({
        ...prev,
        currentPage: 1,
      }));
    }
  }, [actionTypeFilter, entityTypeFilter, user]);

  // Fetch logs when pagination, filters, or sorting changes
  useEffect(() => {
    if (user && user.role === "ADMIN") {
      fetchLogs();
    }
  }, [
    pagination.currentPage,
    pagination.itemsPerPage,
    sortField,
    sortDirection,
    actionTypeFilter,
    entityTypeFilter,
    user,
  ]);

  // Update the page changing functions
  const setCurrentPage = (page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  const setItemsPerPage = (pageSize: number) => {
    setPagination((prev) => ({
      ...prev,
      itemsPerPage: pageSize,
      currentPage: 1, // Reset to page 1 when changing page size
    }));
  };

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
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          System Activity Logs
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Filter by Action Type */}
          <div className="relative">
            <label
              htmlFor="actionTypeFilter"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Action Type Filter
            </label>
            <select
              id="actionTypeFilter"
              value={actionTypeFilter}
              onChange={(e) => setActionTypeFilter(e.target.value)}
              className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 py-2 px-3 pr-8 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Actions</option>
              {enumValues.actionTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Entity Type */}
          <div className="relative">
            <label
              htmlFor="entityTypeFilter"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Entity Type Filter
            </label>
            <select
              id="entityTypeFilter"
              value={entityTypeFilter}
              onChange={(e) => setEntityTypeFilter(e.target.value)}
              className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 py-2 px-3 pr-8 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Entities</option>
              {enumValues.entityTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Sort by Field */}
          <div className="relative">
            <label
              htmlFor="sortField"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Sort by
            </label>
            <select
              id="sortField"
              value={sortField}
              onChange={(e) => setSortField(e.target.value as SortField)}
              className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 py-2 px-3 pr-8 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="timestamp">Timestamp</option>
              <option value="user">User</option>
              <option value="actionType">Action Type</option>
              <option value="entityType">Entity Type</option>
            </select>
          </div>

          {/* Sort Direction */}
          <div className="relative">
            <label
              htmlFor="sortDirection"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Order
            </label>
            <select
              id="sortDirection"
              value={sortDirection}
              onChange={(e) =>
                setSortDirection(e.target.value as SortDirection)
              }
              className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 py-2 px-3 pr-8 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>
      </div>

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
        <>
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
                      No logs found matching the current filters.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="py-3 px-4 text-gray-800 dark:text-gray-200">
                        {format(
                          new Date(log.timestamp),
                          "MMM d, yyyy HH:mm:ss.SSS"
                        )}
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

          {/* Pagination Controls */}
          <div className="mt-6 flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Showing{" "}
                <span className="font-medium">
                  {pagination.totalItems === 0
                    ? 0
                    : Math.min(
                        (pagination.currentPage - 1) * pagination.itemsPerPage +
                          1,
                        pagination.totalItems
                      )}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(
                    pagination.currentPage * pagination.itemsPerPage,
                    pagination.totalItems
                  )}
                </span>{" "}
                of <span className="font-medium">{pagination.totalItems}</span>{" "}
                logs
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <label
                  htmlFor="itemsPerPage"
                  className="mr-2 text-sm text-gray-700 dark:text-gray-300"
                >
                  Show:
                </label>
                <select
                  id="itemsPerPage"
                  value={pagination.itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 py-1 px-2 rounded-md text-sm"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={
                    pagination.currentPage === 1 || pagination.totalItems === 0
                  }
                  className="px-2 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50"
                >
                  ⟨⟨
                </button>
                <button
                  onClick={() => setCurrentPage(pagination.currentPage - 1)}
                  disabled={
                    pagination.currentPage === 1 || pagination.totalItems === 0
                  }
                  className="px-2 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50"
                >
                  ⟨
                </button>

                <span className="text-gray-700 dark:text-gray-300 text-sm">
                  Page {pagination.currentPage} of {pagination.totalPages || 1}
                </span>

                <button
                  onClick={() => setCurrentPage(pagination.currentPage + 1)}
                  disabled={
                    pagination.currentPage === pagination.totalPages ||
                    pagination.totalItems === 0
                  }
                  className="px-2 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50"
                >
                  ⟩
                </button>
                <button
                  onClick={() => setCurrentPage(pagination.totalPages)}
                  disabled={
                    pagination.currentPage === pagination.totalPages ||
                    pagination.totalItems === 0
                  }
                  className="px-2 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50"
                >
                  ⟩⟩
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
