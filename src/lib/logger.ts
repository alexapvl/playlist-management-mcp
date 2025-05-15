import prisma from "./prisma";
import { ActionType, EntityType } from "./constants";

// Define types locally to avoid Prisma client type issues
interface LogData {
  actionType: ActionType;
  entityType: EntityType;
  entityId: string;
  details?: string;
  userId?: string;
}

interface LogWhereInput {
  entityType?: EntityType;
  actionType?: ActionType;
  userId?: string;
  [key: string]: any;
}

interface LogOrderByInput {
  timestamp?: "asc" | "desc";
  actionType?: "asc" | "desc";
  entityType?: "asc" | "desc";
  userId?: "asc" | "desc";
  [key: string]: any;
}

/**
 * Creates a log entry for user actions
 */
export async function logUserAction({
  userId,
  actionType,
  entityType,
  entityId,
  details,
}: {
  userId: string | null;
  actionType: ActionType;
  entityType: EntityType;
  entityId: string;
  details?: string;
}) {
  try {
    // Create the data object with conditional userId
    const logData: LogData = {
      actionType,
      entityType,
      entityId,
      details,
    };

    // Only add userId if it's not null
    if (userId !== null) {
      logData.userId = userId;
    }

    await prisma.log.create({
      data: logData,
    });
  } catch (error) {
    console.error("Error logging user action:", error);
    // Don't throw to prevent blocking the main operation
  }
}

/**
 * Get logs for a specific user
 */
export async function getUserLogs(userId: string, limit = 50, offset = 0) {
  try {
    const logs = await prisma.log.findMany({
      where: { userId },
      orderBy: { timestamp: "desc" },
      take: limit,
      skip: offset,
      include: { user: true },
    });

    return logs;
  } catch (error) {
    console.error("Error fetching user logs:", error);
    throw error;
  }
}

/**
 * Get all logs with filtering and sorting options (admin only)
 */
export async function getAllLogs(
  limit = 100,
  offset = 0,
  entityType?: EntityType | null,
  actionType?: ActionType | null,
  sortField: string = "timestamp",
  sortDirection: "asc" | "desc" = "desc"
) {
  try {
    // Build where clause based on filters
    const where: LogWhereInput = {};

    if (entityType) {
      where.entityType = entityType;
    }

    if (actionType) {
      where.actionType = actionType;
    }

    // Build orderBy object based on sort field and direction
    const orderBy: LogOrderByInput = {};

    // Handle different sort fields
    switch (sortField) {
      case "timestamp":
        orderBy.timestamp = sortDirection;
        break;
      case "actionType":
        orderBy.actionType = sortDirection;
        break;
      case "entityType":
        orderBy.entityType = sortDirection;
        break;
      case "user":
        // For user sorting, we need to sort by userId
        orderBy.userId = sortDirection;
        break;
      default:
        // Default to timestamp
        orderBy.timestamp = sortDirection;
    }

    const logs = await prisma.log.findMany({
      where,
      orderBy,
      take: limit,
      skip: offset,
      include: { user: true },
    });

    return logs;
  } catch (error) {
    console.error("Error fetching all logs:", error);
    throw error;
  }
}

/**
 * Get logs for a specific entity
 */
export async function getEntityLogs(
  entityType: EntityType,
  entityId: string,
  limit = 50
) {
  try {
    const logs = await prisma.log.findMany({
      where: {
        entityType,
        entityId,
      },
      orderBy: { timestamp: "desc" },
      take: limit,
      include: { user: true },
    });

    return logs;
  } catch (error) {
    console.error("Error fetching entity logs:", error);
    throw error;
  }
}

/**
 * Get a count of logs with filters
 */
export async function getLogsCount(
  entityType?: EntityType | null,
  actionType?: ActionType | null
) {
  try {
    // Build where clause based on filters
    const where: LogWhereInput = {};

    if (entityType) {
      where.entityType = entityType;
    }

    if (actionType) {
      where.actionType = actionType;
    }

    const count = await prisma.log.count({ where });
    return count;
  } catch (error) {
    console.error("Error counting logs:", error);
    throw error;
  }
}
