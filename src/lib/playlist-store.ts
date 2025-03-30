import { mockPlaylists } from "@/data/playlists";
import { Playlist } from "@/types";

// In-memory data store that can be imported by multiple routes
export let playlists: Playlist[] = [...mockPlaylists];

// Helper function to filter and sort playlists
export function filterAndSortPlaylists(
  items: Playlist[],
  query?: string,
  sortType?: string
): Playlist[] {
  let results = [...items];

  // Apply search filter
  if (query?.trim()) {
    const searchQuery = query.toLowerCase();
    results = results.filter(
      (playlist) =>
        playlist.name.toLowerCase().includes(searchQuery) ||
        playlist.description.toLowerCase().includes(searchQuery)
    );
  }

  // Apply sorting
  if (sortType === "alphabetical") {
    results.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortType === "numberOfSongsDesc") {
    results.sort((a, b) => b.songs.length - a.songs.length);
  } else if (sortType === "numberOfSongsAsc") {
    results.sort((a, b) => a.songs.length - b.songs.length);
  }

  return results;
}
