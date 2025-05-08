import { NextRequest, NextResponse } from "next/server";
import {
  getAllLogs,
  getEntityLogs,
  getUserLogs,
  getLogsCount,
} from "@/lib/logger";
import { getCurrentUser } from "@/lib/auth";
import { EntityType, ActionType } from "@/generated/prisma";

export async function GET(request: NextRequest) {
  try {
    // Check if the user is authenticated and is an admin
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const userId = searchParams.get("userId") || undefined;
    const entityType = searchParams.get("entityType") as EntityType | null;
    const actionType = searchParams.get("actionType") as ActionType | null;
    const entityId = searchParams.get("entityId") || undefined;
    const countOnly = searchParams.get("countOnly") === "true";
    const sortField = searchParams.get("sortField") || "timestamp";
    const sortDirection = (searchParams.get("sortDirection") || "desc") as
      | "asc"
      | "desc";

    // If countOnly is true, just return the count
    if (countOnly) {
      let count;
      if (entityType && entityId) {
        // For entity-specific logs, fetch them all and count (this could be optimized further)
        const logs = await getEntityLogs(entityType, entityId, 1000);
        count = logs.length;
      } else if (userId) {
        // For user-specific logs, fetch count from a new count function
        count = await getUserLogsCount(userId);
      } else {
        // For all logs, fetch count using our new count function
        count = await getLogsCount(entityType, actionType);
      }

      return NextResponse.json({ count });
    }

    // Get metadata about available enum values
    if (searchParams.get("metadata") === "true") {
      return NextResponse.json({
        actionTypes: Object.values(ActionType),
        entityTypes: Object.values(EntityType),
      });
    }

    // Fetch logs based on query parameters
    let logs;

    if (entityType && entityId) {
      logs = await getEntityLogs(entityType, entityId, limit);
    } else if (userId) {
      logs = await getUserLogs(userId, limit, offset);
    } else {
      // Use the enhanced getAllLogs with filtering and sorting
      logs = await getAllLogs(
        limit,
        offset,
        entityType,
        actionType,
        sortField,
        sortDirection
      );
    }

    return NextResponse.json(logs);
  } catch (error) {
    console.error("Error fetching logs:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching logs" },
      { status: 500 }
    );
  }
}

// This function isn't needed anymore since we're using getLogsCount
// async function getAllLogsCount(entityType?: EntityType | null, actionType?: ActionType | null) {
//   const logs = await getAllLogs(1000000, 0, entityType, actionType);
//   return logs.length;
// }

async function getUserLogsCount(userId: string) {
  // This is a temporary implementation until logger.ts is updated with a proper count function
  const logs = await getUserLogs(userId, 1000000, 0);
  return logs.length;
}
