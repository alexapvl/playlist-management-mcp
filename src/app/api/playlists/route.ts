import { NextRequest, NextResponse } from "next/server";
import { Playlist, Song } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { filterAndSortPlaylists } from "@/lib/playlist-store";
import { playlistSchema } from "@/lib/validation";
import prisma from "@/lib/prisma";
import { logUserAction } from "@/lib/logger";
import { ActionType, EntityType } from "@/generated/prisma";

// Add timeout for request handling
const TIMEOUT_MS = 10000;

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
  // Create an AbortController for handling timeouts
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";
    const sortType = searchParams.get("sort") || "none";

    // Add pagination parameters
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");

    // Calculate skip for pagination
    const skip = (page - 1) * pageSize;

    // Building search conditions
    let whereCondition = {};

    if (query) {
      // Use fulltext search if query is present
      whereCondition = {
        OR: [
          { name: { contains: query } },
          { description: { contains: query } },
        ],
      };

      // For MySQL 8+ with fulltext support, use this instead:
      // whereCondition = {
      //   OR: [
      //     { name: { search: query } },
      //     { description: { search: query } },
      //   ],
      // };
    }

    // Get total count for pagination info
    const totalCount = await prisma.playlist.count({
      where: query
        ? {
            OR: [
              { name: { contains: query } },
              { description: { contains: query } },
            ],
          }
        : undefined,
    });

    // Build orderBy conditions based on sortType
    let orderByCondition = {};

    if (sortType === "alphabetical") {
      orderByCondition = { name: "asc" };
    } else if (sortType === "numberOfSongsDesc") {
      orderByCondition = { songCount: "desc" }; // Use the new songCount field
    } else if (sortType === "numberOfSongsAsc") {
      orderByCondition = { songCount: "asc" }; // Use the new songCount field
    } else {
      orderByCondition = { updatedAt: "desc" }; // Default sort
    }

    // Apply pagination and filtering at the database level
    const prismaPlaylists = await prisma.playlist.findMany({
      skip,
      take: pageSize,
      where: whereCondition,
      include: {
        songs: true, // Using the correct field name in the updated Prisma client
      },
      orderBy: orderByCondition,
    });

    // Transform Prisma model to match the expected Playlist interface
    const playlists: Playlist[] = prismaPlaylists.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      coverImage: p.coverImage || undefined,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      songs: p.songs.map((s: any) => ({
        id: s.id,
        title: s.title,
        artist: s.artist,
        album: s.album || undefined,
        duration: s.duration || 0,
      })),
    }));

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / pageSize);

    // Get user ID for logging
    const userId = request.cookies.get("auth_token")?.value || null;

    // Log the playlist read action
    try {
      await logUserAction({
        userId,
        actionType: ActionType.READ,
        entityType: EntityType.PLAYLIST,
        entityId: "all", // Reading all playlists
        details: `GET /api/playlists - Query: ${query}, Sort: ${sortType}, Page: ${page}`,
      });
    } catch (error) {
      console.error("Error logging playlist read action:", error);
      // Continue execution even if logging fails
    }

    // Clear the timeout since we're done
    clearTimeout(timeoutId);

    return NextResponse.json({
      playlists,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalCount,
        itemsPerPage: pageSize,
      },
    });
  } catch (error: unknown) {
    // Clear the timeout
    clearTimeout(timeoutId);

    // Handle aborted requests
    if (
      error &&
      typeof error === "object" &&
      "name" in error &&
      error.name === "AbortError"
    ) {
      return NextResponse.json(
        { error: "Request timeout exceeded" },
        { status: 408 }
      );
    }

    console.error("Error fetching playlists:", error);
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
    const songCount = body.songs?.length || 0;

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

    // Get auth token
    const token = request.cookies.get("auth_token")?.value;

    await prisma.playlist.create({
      data: {
        id: newPlaylist.id,
        name: newPlaylist.name,
        description: newPlaylist.description,
        coverImage: newPlaylist.coverImage,
        updatedAt: now,
        createdAt: now,
        songCount, // Store the song count for optimized sorting
        userId: token, // Associate the playlist with the user
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

    // Log the playlist creation
    try {
      await logUserAction({
        userId: token || null,
        actionType: ActionType.CREATE,
        entityType: EntityType.PLAYLIST,
        entityId: newPlaylist.id,
        details: `Created playlist "${newPlaylist.name}" with ${songCount} songs`,
      });
    } catch (error) {
      console.error("Error logging playlist creation:", error);
      // Continue execution even if logging fails
    }

    return NextResponse.json({ playlist: newPlaylist }, { status: 201 });
  } catch (error) {
    console.error("Error creating playlist:", error);

    // Better error handling with specifics if available
    let errorMessage = "Failed to create playlist";
    if (error instanceof Error) {
      errorMessage += `: ${error.message}`;
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
