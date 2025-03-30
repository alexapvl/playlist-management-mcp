import { NextRequest, NextResponse } from "next/server";
import { Playlist } from "@/types";
import { playlists } from "@/lib/playlist-store";
import { playlistUpdateSchema } from "@/lib/validation";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const playlist = playlists.find((p) => p.id === params.id);

    if (!playlist) {
      return NextResponse.json(
        { error: "Playlist not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ playlist });
  } catch (error) {
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
    const playlistIndex = playlists.findIndex((p) => p.id === playlistId);

    if (playlistIndex === -1) {
      return NextResponse.json(
        { error: "Playlist not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Validate the request body
    const validation = playlistUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.format() },
        { status: 400 }
      );
    }

    // Update the playlist
    const updatedPlaylist = {
      ...playlists[playlistIndex],
      ...body,
      updatedAt: new Date(),
    };

    playlists[playlistIndex] = updatedPlaylist;

    return NextResponse.json({ playlist: updatedPlaylist });
  } catch (error) {
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
    const playlistId = params.id;
    const playlistIndex = playlists.findIndex((p) => p.id === playlistId);

    if (playlistIndex === -1) {
      return NextResponse.json(
        { error: "Playlist not found" },
        { status: 404 }
      );
    }

    // Remove the playlist
    const removedPlaylist = playlists[playlistIndex];
    playlists.splice(playlistIndex, 1);

    return NextResponse.json(
      { success: true, playlist: removedPlaylist },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete playlist" },
      { status: 500 }
    );
  }
}
