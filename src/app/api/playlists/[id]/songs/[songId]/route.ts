import { NextRequest, NextResponse } from "next/server";
import { songUpdateSchema } from "@/lib/validation";
import prisma from "@/lib/prisma";
import { Song } from "@/types";
import { logUserAction } from "@/lib/logger";
import { ActionType, EntityType } from "@/generated/prisma";

interface RouteParams {
  params: {
    id: string;
    songId: string;
  };
}

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

// Get a specific song
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: playlistId, songId } = params;

    // Check if playlist exists
    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
    });

    if (!playlist) {
      return NextResponse.json(
        { error: "Playlist not found" },
        { status: 404 }
      );
    }

    // Find the song
    const song = await prisma.song.findFirst({
      where: {
        id: songId,
        playlistId,
      },
    });

    if (!song) {
      return NextResponse.json({ error: "Song not found" }, { status: 404 });
    }

    // Format response
    const formattedSong: Song = {
      id: song.id,
      title: song.title,
      artist: song.artist,
      album: song.album || undefined,
      duration: song.duration || 0,
    };

    // Get user ID for logging
    const userId = request.cookies.get("auth_token")?.value || null;

    // Log the song view
    try {
      await logUserAction({
        userId,
        actionType: ActionType.READ,
        entityType: EntityType.SONG,
        entityId: songId,
        details: `Viewed song "${song.title}" by ${song.artist} in playlist "${playlist.name}"`,
      });
    } catch (error) {
      console.error("Error logging song view:", error);
    }

    return NextResponse.json({ song: formattedSong });
  } catch (error) {
    console.error("Error fetching song:", error);
    return NextResponse.json(
      { error: "Failed to fetch song" },
      { status: 500 }
    );
  }
}

// Update a song
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: playlistId, songId } = params;

    // Check if playlist exists
    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
    });

    if (!playlist) {
      return NextResponse.json(
        { error: "Playlist not found" },
        { status: 404 }
      );
    }

    // Check if song exists
    const existingSong = await prisma.song.findFirst({
      where: {
        id: songId,
        playlistId,
      },
    });

    if (!existingSong) {
      return NextResponse.json({ error: "Song not found" }, { status: 404 });
    }

    const body = await request.json();
    console.log("Received update data:", body); // Log the received data

    // Validate the request body
    const validation = songUpdateSchema.safeParse(body);

    if (!validation.success) {
      console.error("Validation error:", validation.error.format());
      return NextResponse.json(
        { error: validation.error.format() },
        { status: 400 }
      );
    }

    // Prepare update data (only include fields that are present)
    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.artist !== undefined) updateData.artist = body.artist;
    if (body.album !== undefined) updateData.album = body.album || null; // Use null for DB
    if (body.duration !== undefined) {
      updateData.duration =
        typeof body.duration === "number" ? body.duration : 0;
    }

    // Update the song
    const updatedSong = await prisma.song.update({
      where: { id: songId },
      data: updateData,
    });

    console.log("Updated song in database:", updatedSong); // Log the updated song

    // Update playlist's updatedAt time
    await prisma.playlist.update({
      where: { id: playlistId },
      data: { updatedAt: new Date() },
    });

    // Get user ID for logging
    const userId = request.cookies.get("auth_token")?.value || null;

    // Track changes for logging
    const changes = [];
    if (body.title !== undefined && body.title !== existingSong.title) {
      changes.push(`title from "${existingSong.title}" to "${body.title}"`);
    }
    if (body.artist !== undefined && body.artist !== existingSong.artist) {
      changes.push(`artist from "${existingSong.artist}" to "${body.artist}"`);
    }
    if (body.album !== undefined && body.album !== existingSong.album) {
      const oldAlbum = existingSong.album || "none";
      const newAlbum = body.album || "none";
      changes.push(`album from "${oldAlbum}" to "${newAlbum}"`);
    }
    if (
      body.duration !== undefined &&
      body.duration !== existingSong.duration
    ) {
      changes.push(
        `duration from ${existingSong.duration}s to ${body.duration}s`
      );
    }

    // Log the song update
    try {
      await logUserAction({
        userId,
        actionType: ActionType.UPDATE,
        entityType: EntityType.SONG,
        entityId: songId,
        details: `Updated song in playlist "${
          playlist.name
        }". Changed: ${changes.join(", ")}`,
      });
    } catch (error) {
      console.error("Error logging song update:", error);
    }

    // Format response
    const formattedSong: Song = {
      id: updatedSong.id,
      title: updatedSong.title,
      artist: updatedSong.artist,
      album: updatedSong.album || undefined,
      duration: updatedSong.duration || 0,
    };

    console.log("Returning formatted song:", formattedSong); // Log the formatted response
    return NextResponse.json({ song: formattedSong });
  } catch (error) {
    console.error("Error updating song:", error);
    return NextResponse.json(
      { error: "Failed to update song" },
      { status: 500 }
    );
  }
}

// Delete a song
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: playlistId, songId } = params;

    // Check if playlist exists
    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
    });

    if (!playlist) {
      return NextResponse.json(
        { error: "Playlist not found" },
        { status: 404 }
      );
    }

    // Check if song exists
    const songToDelete = await prisma.song.findFirst({
      where: {
        id: songId,
        playlistId,
      },
    });

    if (!songToDelete) {
      return NextResponse.json({ error: "Song not found" }, { status: 404 });
    }

    // Format for response before deletion
    const formattedSong: Song = {
      id: songToDelete.id,
      title: songToDelete.title,
      artist: songToDelete.artist,
      album: songToDelete.album || undefined,
      duration: songToDelete.duration || 0,
    };

    // Delete the song
    await prisma.song.delete({
      where: { id: songId },
    });

    // Get updated song count
    const songCount = await prisma.song.count({
      where: { playlistId },
    });

    // Update playlist's updatedAt time and songCount
    await prisma.playlist.update({
      where: { id: playlistId },
      data: {
        updatedAt: new Date(),
        songCount: songCount, // Update songCount for better performance
      },
    });

    // Get user ID for logging
    const userId = request.cookies.get("auth_token")?.value || null;

    // Log the song deletion
    try {
      await logUserAction({
        userId,
        actionType: ActionType.DELETE,
        entityType: EntityType.SONG,
        entityId: songId,
        details: `Deleted song "${songToDelete.title}" by ${songToDelete.artist} from playlist "${playlist.name}"`,
      });
    } catch (error) {
      console.error("Error logging song deletion:", error);
    }

    return NextResponse.json(
      { success: true, song: formattedSong },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting song:", error);
    return NextResponse.json(
      { error: "Failed to delete song" },
      { status: 500 }
    );
  }
}
