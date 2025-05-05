import { NextRequest, NextResponse } from "next/server";
import { Song } from "@/types";
import { songSchema } from "@/lib/validation";
import { v4 as uuidv4 } from "uuid";
import prisma from "@/lib/prisma";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

// Get all songs from a playlist
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const playlistId = params.id;

    // Check if playlist exists
    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
      include: { Song: true },
    });

    if (!playlist) {
      return NextResponse.json(
        { error: "Playlist not found" },
        { status: 404 }
      );
    }

    // Transform to expected format
    const songs: Song[] = playlist.Song.map((s) => ({
      id: s.id,
      title: s.title,
      artist: s.artist,
      album: s.album || undefined,
      duration: s.duration || 0,
    }));

    return NextResponse.json({ songs });
  } catch (error) {
    console.error("Error fetching songs:", error);
    return NextResponse.json(
      { error: "Failed to fetch songs" },
      { status: 500 }
    );
  }
}

// Add a song to a playlist
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const playlistId = params.id;

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

    const body = await request.json();
    console.log("Received song data:", body); // Log the received data

    // Validate the request body
    const validation = songSchema.safeParse(body);

    if (!validation.success) {
      console.error("Validation error:", validation.error.format());
      return NextResponse.json(
        { error: validation.error.format() },
        { status: 400 }
      );
    }

    // Create new song with ID
    const songId = uuidv4();

    // Ensure numeric duration (default to 0 if not provided or invalid)
    const duration = typeof body.duration === "number" ? body.duration : 0;

    // Add song to database
    const newSong = await prisma.song.create({
      data: {
        id: songId,
        title: body.title,
        artist: body.artist,
        album: body.album || null, // Use null instead of undefined for database
        duration: duration,
        playlistId,
      },
    });

    console.log("Created song in database:", newSong); // Log the created song

    // Get current song count
    const songCount = await prisma.song.count({
      where: { playlistId },
    });

    // Update playlist's updatedAt and songCount
    await prisma.playlist.update({
      where: { id: playlistId },
      data: {
        updatedAt: new Date(),
        songCount: songCount, // Update songCount field for better sorting performance
      },
    });

    // Format for response
    const formattedSong: Song = {
      id: newSong.id,
      title: newSong.title,
      artist: newSong.artist,
      album: newSong.album || undefined,
      duration: newSong.duration || 0,
    };

    console.log("Returning formatted song:", formattedSong); // Log the formatted response
    return NextResponse.json({ song: formattedSong }, { status: 201 });
  } catch (error) {
    console.error("Error adding song:", error);
    return NextResponse.json({ error: "Failed to add song" }, { status: 500 });
  }
}

// Check for file existence
