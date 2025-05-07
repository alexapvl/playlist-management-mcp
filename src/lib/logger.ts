import prisma from "./prisma";
import { ActionType, EntityType } from "@/generated/prisma";

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
  userId: string;
  actionType: ActionType;
  entityType: EntityType;
  entityId: string;
  details?: string;
}) {
  try {
    await prisma.log.create({
      data: {
        userId,
        actionType,
        entityType,
        entityId,
        details,
      },
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
 * Get all logs (admin only)
 */
export async function getAllLogs(limit = 100, offset = 0) {
  try {
    const logs = await prisma.log.findMany({
      orderBy: { timestamp: "desc" },
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
