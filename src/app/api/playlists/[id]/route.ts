import { NextRequest, NextResponse } from "next/server";
import { Playlist } from "@/types";
import { playlistUpdateSchema } from "@/lib/validation";
import prisma from "@/lib/prisma";
import { logUserAction } from "@/lib/logger";
import { ActionType, EntityType } from "@/generated/prisma";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const playlistId = id;

    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
      include: { songs: true },
    });

    if (!playlist) {
      return NextResponse.json(
        { error: "Playlist not found" },
        { status: 404 }
      );
    }

    // Transform Prisma model to match the expected Playlist interface
    const formattedPlaylist: Playlist = {
      id: playlist.id,
      name: playlist.name,
      description: playlist.description,
      coverImage: playlist.coverImage || undefined,
      createdAt: playlist.createdAt,
      updatedAt: playlist.updatedAt,
      songs: playlist.songs.map((s: any) => ({
        id: s.id,
        title: s.title,
        artist: s.artist,
        album: s.album || undefined,
        duration: s.duration || 0,
      })),
    };

    // Get user ID for logging
    const userId = request.cookies.get("auth_token")?.value || null;

    // Log the playlist read action
    try {
      await logUserAction({
        userId,
        actionType: ActionType.READ,
        entityType: EntityType.PLAYLIST,
        entityId: playlistId,
        details: `Viewed playlist "${playlist.name}"`,
      });
    } catch (error) {
      console.error("Error logging playlist view:", error);
    }

    return NextResponse.json({ playlist: formattedPlaylist });
  } catch (error) {
    console.error("Error fetching playlist:", error);
    return NextResponse.json(
      { error: "Failed to fetch playlist" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const playlistId = id;
    console.log("Playlist ID:", playlistId);

    // Check if playlist exists
    const existingPlaylist = await prisma.playlist.findUnique({
      where: { id: playlistId },
      include: { songs: true },
    });

    if (!existingPlaylist) {
      return NextResponse.json(
        { error: "Playlist not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    console.log("Body:", body);

    // Validate the request body
    const validation = playlistUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.format() },
        { status: 400 }
      );
    }

    // Prepare update data for basic playlist info
    const updateData: any = {
      name: body.name || existingPlaylist.name,
      description: body.description || existingPlaylist.description,
      coverImage: body.coverImage || existingPlaylist.coverImage,
      updatedAt: new Date(),
    };

    // Update the playlist's basic information first
    const updatedPlaylist = await prisma.playlist.update({
      where: { id: playlistId },
      data: updateData,
    });

    // Track changes for logging
    const changes = [];
    if (body.name && body.name !== existingPlaylist.name) {
      changes.push(`name from "${existingPlaylist.name}" to "${body.name}"`);
    }
    if (body.description && body.description !== existingPlaylist.description) {
      changes.push("description");
    }
    if (body.coverImage && body.coverImage !== existingPlaylist.coverImage) {
      changes.push("cover image");
    }

    // Handle songs if they're provided in the request
    let songsAdded = 0;
    let songsRemoved = 0;
    let songsUpdated = 0;

    if (body.songs && Array.isArray(body.songs)) {
      console.log(`Processing ${body.songs.length} songs`);

      // Create a set of song IDs from the request for efficient lookup
      const requestSongIds = new Set(
        body.songs
          .filter((song: { id?: string }) => song.id)
          .map((song: { id: string }) => song.id)
      );

      // Find songs that exist in the playlist but not in the request
      const songsToDelete = existingPlaylist.songs.filter(
        (song) => !requestSongIds.has(song.id)
      );

      // Delete songs that are no longer in the playlist
      if (songsToDelete.length > 0) {
        songsRemoved = songsToDelete.length;
        console.log(
          `Deleting ${songsToDelete.length} songs no longer in playlist`
        );

        for (const song of songsToDelete) {
          await prisma.song.delete({
            where: { id: song.id },
          });
          console.log(`Deleted song ${song.id} from playlist ${playlistId}`);
        }
      }

      // Process each song individually to ensure proper handling
      for (const song of body.songs) {
        if (song.id) {
          // Check if this song exists
          const existingSong = await prisma.song.findUnique({
            where: { id: song.id },
          });

          if (existingSong) {
            // If it exists but not connected to this playlist, connect it
            if (existingSong.playlistId !== playlistId) {
              await prisma.song.update({
                where: { id: song.id },
                data: { playlistId: playlistId },
              });
              console.log(
                `Connected existing song ${song.id} to playlist ${playlistId}`
              );
              songsAdded++;
            } else {
              // The song is already in this playlist, check if it needs an update
              if (
                existingSong.title !== song.title ||
                existingSong.artist !== song.artist ||
                existingSong.album !== song.album ||
                existingSong.duration !== song.duration
              ) {
                songsUpdated++;
              }
            }
          } else {
            // Song ID provided but not found, create a new one with this ID
            await prisma.song.create({
              data: {
                id: song.id,
                title: song.title,
                artist: song.artist,
                album: song.album || null,
                duration: typeof song.duration === "number" ? song.duration : 0,
                playlistId: playlistId,
              },
            });
            console.log(`Created song with provided ID ${song.id}`);
            songsAdded++;
          }
        } else {
          // No ID provided, create a new song
          const newSong = await prisma.song.create({
            data: {
              id: Math.random().toString(36).substring(2, 15),
              title: song.title,
              artist: song.artist,
              album: song.album || null,
              duration: typeof song.duration === "number" ? song.duration : 0,
              playlistId: playlistId,
            },
          });
          console.log(`Created new song with generated ID ${newSong.id}`);
          songsAdded++;
        }
      }
    }

    // Fetch the updated playlist with all songs
    const finalPlaylist = await prisma.playlist.findUnique({
      where: { id: playlistId },
      include: { songs: true },
    });

    // Handle case where finalPlaylist might be null
    if (!finalPlaylist) {
      return NextResponse.json(
        { error: "Failed to retrieve updated playlist" },
        { status: 500 }
      );
    }

    // Get user ID for logging
    const userId = request.cookies.get("auth_token")?.value || null;

    // Build log details
    let logDetails = "Updated playlist";
    if (changes.length > 0) {
      logDetails += ` fields: ${changes.join(", ")}`;
    }
    if (songsAdded > 0 || songsRemoved > 0 || songsUpdated > 0) {
      logDetails += `. Songs: ${songsAdded} added, ${songsRemoved} removed, ${songsUpdated} updated`;
    }

    // Log the playlist update action
    try {
      await logUserAction({
        userId,
        actionType: ActionType.UPDATE,
        entityType: EntityType.PLAYLIST,
        entityId: playlistId,
        details: logDetails,
      });
    } catch (error) {
      console.error("Error logging playlist update:", error);
    }

    // Format the response data
    const formattedPlaylist: Playlist = {
      id: finalPlaylist.id,
      name: finalPlaylist.name,
      description: finalPlaylist.description,
      coverImage: finalPlaylist.coverImage || undefined,
      createdAt: finalPlaylist.createdAt,
      updatedAt: finalPlaylist.updatedAt,
      songs: finalPlaylist.songs.map((s: any) => ({
        id: s.id,
        title: s.title,
        artist: s.artist,
        album: s.album || undefined,
        duration: s.duration || 0,
      })),
    };

    return NextResponse.json({ playlist: formattedPlaylist });
  } catch (error) {
    console.error("Error updating playlist:", error);
    return NextResponse.json(
      { error: "Failed to update playlist" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const playlistId = id;

    // Additional authentication check at API level
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if playlist exists
    const existingPlaylist = await prisma.playlist.findUnique({
      where: { id: playlistId },
    });

    if (!existingPlaylist) {
      return NextResponse.json(
        { error: "Playlist not found" },
        { status: 404 }
      );
    }

    // Delete the playlist (this will cascade delete songs due to the onDelete: Cascade setting)
    await prisma.playlist.delete({
      where: { id: playlistId },
    });

    // Log the playlist deletion
    try {
      await logUserAction({
        userId: token || null,
        actionType: ActionType.DELETE,
        entityType: EntityType.PLAYLIST,
        entityId: playlistId,
        details: `Deleted playlist "${existingPlaylist.name}"`,
      });
    } catch (error) {
      console.error("Error logging playlist deletion:", error);
    }

    return NextResponse.json(
      { message: "Playlist deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting playlist:", error);
    return NextResponse.json(
      { error: "Failed to delete playlist" },
      { status: 500 }
    );
  }
}
