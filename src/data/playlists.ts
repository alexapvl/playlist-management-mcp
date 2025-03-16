import { Playlist } from "../types";

// Mock data for playlists
export const mockPlaylists: Playlist[] = [
  {
    id: "1",
    name: "Workout Mix",
    description: "High energy songs to keep you motivated during workouts",
    coverImage:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop",
    songs: [
      { id: "101", title: "Eye of the Tiger", artist: "Survivor", duration: 245 },
      { id: "102", title: "Stronger", artist: "Kanye West", duration: 312 },
      { id: "103", title: "Till I Collapse", artist: "Eminem", duration: 298 },
    ],
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2023-03-20"),
  },
  {
    id: "2",
    name: "Chill Vibes",
    description: "Relaxing tunes for unwinding after a long day",
    coverImage:
      "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&h=500&fit=crop",
    songs: [
      { id: "201", title: "Waves", artist: "Chill Harris", duration: 267 },
      { id: "202", title: "Midnight City", artist: "M83", duration: 244 },
      { id: "203", title: "Intro", artist: "The xx", duration: 128 },
    ],
    createdAt: new Date("2023-02-10"),
    updatedAt: new Date("2023-02-10"),
  },
  {
    id: "3",
    name: "Road Trip",
    description: "Perfect soundtrack for long drives",
    coverImage:
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500&h=500&fit=crop",
    songs: [
      { id: "301", title: "Take It Easy", artist: "Eagles", duration: 187 },
      { id: "302", title: "Life is a Highway", artist: "Tom Cochrane", duration: 265 },
      { id: "303", title: "On the Road Again", artist: "Willie Nelson", duration: 150 },
    ],
    createdAt: new Date("2023-03-05"),
    updatedAt: new Date("2023-04-12"),
  },
];

// Helper functions for CRUD operations
export const getPlaylists = () => mockPlaylists;

export const getPlaylistById = (id: string) => {
  return mockPlaylists.find((playlist) => playlist.id === id);
};

export const searchPlaylists = (query: string) => {
  const lowercaseQuery = query.toLowerCase();
  return mockPlaylists.filter(
    (playlist) =>
      playlist.name.toLowerCase().includes(lowercaseQuery) ||
      playlist.description.toLowerCase().includes(lowercaseQuery)
  );
};
