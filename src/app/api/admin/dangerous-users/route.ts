import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

/**
 * API endpoint to detect potentially dangerous users
 * based on rapid request frequency criteria
 */
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

    // Get dangerous users (users who made 30+ requests within a 60-second window)
    const dangerousUsers = await getDangerousUsers();

    return NextResponse.json(dangerousUsers);
  } catch (error) {
    console.error("Error fetching dangerous users:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching dangerous users" },
      { status: 500 }
    );
  }
}

/**
 * Identifies users who have made more than 30 requests in any 60-second time window
 * Only considers logs from the past 10 minutes
 */
async function getDangerousUsers() {
  // Calculate timestamp from 10 minutes ago
  const tenMinutesAgo = new Date();
  tenMinutesAgo.setMinutes(tenMinutesAgo.getMinutes() - 10);

  // Get logs from the past 10 minutes, ordered by timestamp
  const logs = await prisma.log.findMany({
    where: {
      timestamp: {
        gte: tenMinutesAgo,
      },
    },
    orderBy: { timestamp: "asc" },
    include: { user: true },
  });

  // Skip processing if no recent logs
  if (logs.length === 0) {
    return [];
  }

  // Group logs by userId
  const userLogs: Record<
    string,
    { timestamp: Date; userId: string; user: any }[]
  > = {};

  logs.forEach((log) => {
    if (log.userId) {
      if (!userLogs[log.userId]) {
        userLogs[log.userId] = [];
      }
      userLogs[log.userId].push({
        timestamp: new Date(log.timestamp),
        userId: log.userId,
        user: log.user,
      });
    }
  });

  // Find users with 30+ requests in a 60-second window
  const dangerousUsers = [];

  for (const userId in userLogs) {
    const userLogEntries = userLogs[userId];

    // Skip users with less than 30 logs (they can't be dangerous by our criteria)
    if (userLogEntries.length < 30) continue;

    // Use sliding window approach to find 30+ requests in 60 seconds
    for (let i = 0; i < userLogEntries.length - 29; i++) {
      const startTime = userLogEntries[i].timestamp;
      const endTime = userLogEntries[i + 29].timestamp;

      // Check if the time difference is <= 60 seconds (60000 ms)
      const timeDiffMs = endTime.getTime() - startTime.getTime();
      if (timeDiffMs <= 60000) {
        // This user is dangerous
        dangerousUsers.push({
          userId: userId,
          username:
            userLogEntries[0].user?.name ||
            userLogEntries[0].user?.email ||
            "Unknown",
          email: userLogEntries[0].user?.email || "Unknown",
          requestCount: userLogEntries.length,
          timeframeSeconds: Math.round(timeDiffMs / 1000),
          role: userLogEntries[0].user?.role || "Unknown",
        });

        // Break since we've already identified this user as dangerous
        break;
      }
    }
  }

  return dangerousUsers;
}
