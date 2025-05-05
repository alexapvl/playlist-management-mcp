import { NextRequest, NextResponse } from "next/server";
import { Playlist, Song } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { filterAndSortPlaylists } from "@/lib/playlist-store";
import { playlistSchema } from "@/lib/validation";
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";
    const sortType = searchParams.get("sort") || "none";

    const prismaPlaylists = await prisma.playlist.findMany({
      include: {
        Song: true, // Include songs with each playlist
      },
    });

    // Transform Prisma model to match the expected Playlist interface
    const playlists: Playlist[] = prismaPlaylists.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      coverImage: p.coverImage || undefined,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      songs: p.Song.map((s) => ({
        id: s.id,
        title: s.title,
        artist: s.artist,
        album: s.album || undefined,
        duration: s.duration || 0,
      })),
    }));

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

    const now = new Date();

    // Create new playlist
    const newPlaylist: Playlist = {
      id: uuidv4(),
      ...body,
      songs: body.songs.map((song: Omit<Song, "id">) => ({
        id: uuidv4(),
        ...song,
      })),
      createdAt: now,
      updatedAt: now,
    };

    await prisma.playlist.create({
      data: {
        id: newPlaylist.id,
        name: newPlaylist.name,
        description: newPlaylist.description,
        coverImage: newPlaylist.coverImage,
        updatedAt: now,
        createdAt: now,
      },
    });

    await prisma.song.createMany({
      data: newPlaylist.songs.map((song) => ({
        id: song.id, // Use the already generated ID
        title: song.title,
        artist: song.artist,
        album: song.album,
        duration: song.duration || 0,
        playlistId: newPlaylist.id,
      })),
    });

    return NextResponse.json({ playlist: newPlaylist }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create playlist" },
      { status: 500 }
    );
  }
}
