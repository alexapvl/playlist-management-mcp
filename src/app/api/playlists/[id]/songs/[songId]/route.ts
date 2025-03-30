import { NextRequest, NextResponse } from "next/server";
import { playlists } from "@/lib/playlist-store";
import { songUpdateSchema } from "@/lib/validation";

interface RouteParams {
  params: {
    id: string;
    songId: string;
  };
}

// Get a specific song
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id, songId } = params;
    const playlist = playlists.find((p) => p.id === id);

    if (!playlist) {
      return NextResponse.json(
        { error: "Playlist not found" },
        { status: 404 }
      );
    }

    const song = playlist.songs.find((s) => s.id === songId);

    if (!song) {
      return NextResponse.json({ error: "Song not found" }, { status: 404 });
    }

    return NextResponse.json({ song });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch song" },
      { status: 500 }
    );
  }
}

// Update a song
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id, songId } = params;
    const playlistIndex = playlists.findIndex((p) => p.id === id);

    if (playlistIndex === -1) {
      return NextResponse.json(
        { error: "Playlist not found" },
        { status: 404 }
      );
    }

    const songIndex = playlists[playlistIndex].songs.findIndex(
      (s) => s.id === songId
    );

    if (songIndex === -1) {
      return NextResponse.json({ error: "Song not found" }, { status: 404 });
    }

    const body = await request.json();

    // Validate the request body
    const validation = songUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.format() },
        { status: 400 }
      );
    }

    // Update the song
    const updatedSong = {
      ...playlists[playlistIndex].songs[songIndex],
      ...body,
    };

    playlists[playlistIndex].songs[songIndex] = updatedSong;
    playlists[playlistIndex].updatedAt = new Date();

    return NextResponse.json({ song: updatedSong });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update song" },
      { status: 500 }
    );
  }
}

// Delete a song
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id, songId } = params;
    const playlistIndex = playlists.findIndex((p) => p.id === id);

    if (playlistIndex === -1) {
      return NextResponse.json(
        { error: "Playlist not found" },
        { status: 404 }
      );
    }

    const songIndex = playlists[playlistIndex].songs.findIndex(
      (s) => s.id === songId
    );

    if (songIndex === -1) {
      return NextResponse.json({ error: "Song not found" }, { status: 404 });
    }

    // Remove the song
    const removedSong = playlists[playlistIndex].songs[songIndex];
    playlists[playlistIndex].songs.splice(songIndex, 1);
    playlists[playlistIndex].updatedAt = new Date();

    return NextResponse.json(
      { success: true, song: removedSong },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete song" },
      { status: 500 }
    );
  }
}
