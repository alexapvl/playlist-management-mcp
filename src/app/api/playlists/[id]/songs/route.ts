import { NextRequest, NextResponse } from "next/server";
import { Song } from "@/types";
import { playlists } from "@/lib/playlist-store";
import { songSchema } from "@/lib/validation";
import { v4 as uuidv4 } from "uuid";

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
    const resolvedParams = await params;
    const playlistId = resolvedParams.id;
    const playlist = playlists.find((p) => p.id === playlistId);

    if (!playlist) {
      return NextResponse.json(
        { error: "Playlist not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ songs: playlist.songs });
  } catch (error) {
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
    const resolvedParams = await params;
    const playlistId = resolvedParams.id;
    const playlistIndex = playlists.findIndex((p) => p.id === playlistId);

    if (playlistIndex === -1) {
      return NextResponse.json(
        { error: "Playlist not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Validate the request body
    const validation = songSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.format() },
        { status: 400 }
      );
    }

    // Create new song
    const newSong: Song = {
      id: uuidv4(),
      ...body,
    };

    // Add song to playlist
    playlists[playlistIndex].songs.push(newSong);
    playlists[playlistIndex].updatedAt = new Date();

    return NextResponse.json({ song: newSong }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to add song" }, { status: 500 });
  }
}
