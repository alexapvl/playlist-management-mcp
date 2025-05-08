import { NextRequest, NextResponse } from "next/server";
import { getAllLogs, getEntityLogs, getUserLogs } from "@/lib/logger";
import { getCurrentUser } from "@/lib/auth";
import { EntityType } from "@/generated/prisma";

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
    const entityId = searchParams.get("entityId") || undefined;

    // Fetch logs based on query parameters
    let logs;

    if (entityType && entityId) {
      logs = await getEntityLogs(entityType, entityId, limit);
    } else if (userId) {
      logs = await getUserLogs(userId, limit, offset);
    } else {
      logs = await getAllLogs(limit, offset);
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
