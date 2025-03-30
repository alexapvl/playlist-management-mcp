import { z } from "zod";

// Song validation schemas
export const songSchema = z.object({
  title: z.string().min(1, "Title is required"),
  artist: z.string().min(1, "Artist is required"),
  album: z.string().optional(),
  duration: z.number().optional(),
});

export const songUpdateSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  artist: z.string().min(1, "Artist is required").optional(),
  album: z.string().optional(),
  duration: z.number().positive("Duration must be positive").optional(),
});

// Playlist validation schemas
export const playlistSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  coverImage: z.string().url().optional(),
  songs: z.array(songSchema),
});

export const playlistUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().min(1, "Description is required").optional(),
  coverImage: z.string().url().optional(),
  songs: z.array(songSchema).optional(),
});
