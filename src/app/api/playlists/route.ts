import { NextRequest, NextResponse } from "next/server";
import { Playlist, Song } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { playlists, filterAndSortPlaylists } from "@/lib/playlist-store";
import { playlistSchema } from "@/lib/validation";

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";
    const sortType = searchParams.get("sort") || "none";

    const filteredPlaylists = filterAndSortPlaylists(
      playlists,
      query,
      sortType
    );

    return NextResponse.json({ playlists: filteredPlaylists });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch playlists" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the request body
    const validation = playlistSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.format() },
        { status: 400 }
      );
    }

    // Create new playlist
    const newPlaylist: Playlist = {
      id: uuidv4(),
      ...body,
      songs: body.songs.map((song: Omit<Song, "id">) => ({
        ...song,
        id: uuidv4(),
      })),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    playlists.push(newPlaylist);

    return NextResponse.json({ playlist: newPlaylist }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create playlist" },
      { status: 500 }
    );
  }
}
