import { NextRequest, NextResponse } from "next/server";
import { Playlist } from "@/types";
import { playlistUpdateSchema } from "@/lib/validation";
import prisma from "@/lib/prisma";

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
  { params }: { params: { id: string } }
) {
  try {
    const playlistId = params.id;

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
  { params }: { params: { id: string } }
) {
  try {
    const playlistId = params.id;
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

    // Handle songs if they're provided in the request
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
  { params }: { params: { id: string } }
) {
  try {
    const playlistId = (await params).id;

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
      include: { songs: true },
    });

    if (!existingPlaylist) {
      return NextResponse.json(
        { error: "Playlist not found" },
        { status: 404 }
      );
    }

    // If playlist has an owner, verify the user owns this playlist
    if (existingPlaylist.userId && existingPlaylist.userId !== token) {
      return NextResponse.json(
        { error: "You don't have permission to delete this playlist" },
        { status: 403 }
      );
    }

    // Delete the playlist (this will cascade delete songs due to the relation)
    await prisma.playlist.delete({
      where: { id: playlistId },
    });

    // Transform to the expected format for the response
    const formattedPlaylist: Playlist = {
      id: existingPlaylist.id,
      name: existingPlaylist.name,
      description: existingPlaylist.description,
      coverImage: existingPlaylist.coverImage || undefined,
      createdAt: existingPlaylist.createdAt,
      updatedAt: existingPlaylist.updatedAt,
      songs: existingPlaylist.songs.map((s: any) => ({
        id: s.id,
        title: s.title,
        artist: s.artist,
        album: s.album || undefined,
        duration: s.duration || 0,
      })),
    };

    return NextResponse.json(
      { success: true, playlist: formattedPlaylist },
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
