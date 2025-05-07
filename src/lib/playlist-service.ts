import prisma from "./prisma";
import { logUserAction } from "./logger";
import { ActionType, EntityType } from "@/generated/prisma";

/**
 * Creates a new playlist and logs the action
 */
export async function createPlaylist({
  name,
  description,
  coverImage,
  userId,
}: {
  name: string;
  description: string;
  coverImage?: string;
  userId: string;
}) {
  // Create a unique ID for the playlist
  const playlistId = crypto.randomUUID();

  // Create the playlist
  const playlist = await prisma.playlist.create({
    data: {
      id: playlistId,
      name,
      description,
      coverImage,
      userId,
      updatedAt: new Date(),
    },
  });

  // Log the action
  await logUserAction({
    userId,
    actionType: ActionType.CREATE,
    entityType: EntityType.PLAYLIST,
    entityId: playlist.id,
    details: `Created playlist "${name}"`,
  });

  return playlist;
}

/**
 * Updates an existing playlist and logs the action
 */
export async function updatePlaylist({
  id,
  name,
  description,
  coverImage,
  userId,
}: {
  id: string;
  name?: string;
  description?: string;
  coverImage?: string;
  userId: string;
}) {
  // Verify ownership or admin status before updating
  const existingPlaylist = await prisma.playlist.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!existingPlaylist) {
    throw new Error("Playlist not found");
  }

  // Check ownership - this should match your authorization logic
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (existingPlaylist.userId !== userId && user?.role !== "ADMIN") {
    throw new Error("Unauthorized to update this playlist");
  }

  // Update the playlist
  const updatedPlaylist = await prisma.playlist.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(description && { description }),
      ...(coverImage && { coverImage }),
      updatedAt: new Date(),
    },
  });

  // Log the action
  await logUserAction({
    userId,
    actionType: ActionType.UPDATE,
    entityType: EntityType.PLAYLIST,
    entityId: id,
    details: `Updated playlist "${updatedPlaylist.name}"`,
  });

  return updatedPlaylist;
}

/**
 * Deletes a playlist and logs the action
 */
export async function deletePlaylist({
  id,
  userId,
}: {
  id: string;
  userId: string;
}) {
  // Verify ownership or admin status before deleting
  const existingPlaylist = await prisma.playlist.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!existingPlaylist) {
    throw new Error("Playlist not found");
  }

  // Check ownership - this should match your authorization logic
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (existingPlaylist.userId !== userId && user?.role !== "ADMIN") {
    throw new Error("Unauthorized to delete this playlist");
  }

  const playlistName = existingPlaylist.name;

  // Delete the playlist (this will also delete all songs due to cascade)
  await prisma.playlist.delete({
    where: { id },
  });

  // Log the action
  await logUserAction({
    userId,
    actionType: ActionType.DELETE,
    entityType: EntityType.PLAYLIST,
    entityId: id,
    details: `Deleted playlist "${playlistName}"`,
  });

  return { success: true };
}

/**
 * Gets a playlist and logs the read action
 */
export async function getPlaylist({
  id,
  userId,
}: {
  id: string;
  userId?: string;
}) {
  const playlist = await prisma.playlist.findUnique({
    where: { id },
    include: {
      songs: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  if (!playlist) {
    throw new Error("Playlist not found");
  }

  // Log the read action if a user is logged in
  if (userId) {
    await logUserAction({
      userId,
      actionType: ActionType.READ,
      entityType: EntityType.PLAYLIST,
      entityId: id,
      details: `Viewed playlist "${playlist.name}"`,
    });
  }

  return playlist;
}

/**
 * Adds a song to a playlist and logs the action
 */
export async function addSongToPlaylist({
  playlistId,
  title,
  artist,
  album,
  duration,
  userId,
}: {
  playlistId: string;
  title: string;
  artist: string;
  album?: string;
  duration?: number;
  userId: string;
}) {
  // Verify playlist ownership or admin status
  const playlist = await prisma.playlist.findUnique({
    where: { id: playlistId },
  });

  if (!playlist) {
    throw new Error("Playlist not found");
  }

  // Check ownership - this should match your authorization logic
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (playlist.userId !== userId && user?.role !== "ADMIN") {
    throw new Error("Unauthorized to modify this playlist");
  }

  // Create a unique ID for the song
  const songId = crypto.randomUUID();

  // Add the song
  const song = await prisma.song.create({
    data: {
      id: songId,
      title,
      artist,
      album,
      duration,
      playlistId,
    },
  });

  // Update song count on playlist
  await prisma.playlist.update({
    where: { id: playlistId },
    data: {
      songCount: { increment: 1 },
      updatedAt: new Date(),
    },
  });

  // Log the action
  await logUserAction({
    userId,
    actionType: ActionType.CREATE,
    entityType: EntityType.SONG,
    entityId: song.id,
    details: `Added song "${title}" by ${artist} to playlist "${playlist.name}"`,
  });

  return song;
}

/**
 * Removes a song from a playlist and logs the action
 */
export async function removeSongFromPlaylist({
  songId,
  userId,
}: {
  songId: string;
  userId: string;
}) {
  // Get the song with its playlist
  const song = await prisma.song.findUnique({
    where: { id: songId },
    include: { playlist: true },
  });

  if (!song) {
    throw new Error("Song not found");
  }

  const playlist = song.playlist;

  // Check ownership - this should match your authorization logic
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (playlist.userId !== userId && user?.role !== "ADMIN") {
    throw new Error("Unauthorized to modify this playlist");
  }

  // Delete the song
  await prisma.song.delete({
    where: { id: songId },
  });

  // Update song count on playlist
  await prisma.playlist.update({
    where: { id: playlist.id },
    data: {
      songCount: { decrement: 1 },
      updatedAt: new Date(),
    },
  });

  // Log the action
  await logUserAction({
    userId,
    actionType: ActionType.DELETE,
    entityType: EntityType.SONG,
    entityId: songId,
    details: `Removed song "${song.title}" from playlist "${playlist.name}"`,
  });

  return { success: true };
}
