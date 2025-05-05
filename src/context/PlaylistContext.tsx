"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { Playlist } from "../types";
import { v4 as uuidv4 } from "uuid";

interface PlaylistContextType {
  playlists: Playlist[];
  searchResults: Playlist[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  addPlaylist: (
    playlist: Omit<Playlist, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  updatePlaylist: (id: string, playlist: Partial<Playlist>) => Promise<void>;
  deletePlaylist: (id: string) => Promise<void>;
  resetPlaylists: () => Promise<void>;
  addSong: (playlistId: string, song: any) => Promise<void>;
  updateSong: (playlistId: string, songId: string, song: any) => Promise<void>;
  deleteSong: (playlistId: string, songId: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  sortType: "none" | "alphabetical" | "numberOfSongsDesc" | "numberOfSongsAsc";
  setSortType: (
    type: "none" | "alphabetical" | "numberOfSongsDesc" | "numberOfSongsAsc"
  ) => void;
}

const PlaylistContext = createContext<PlaylistContextType | undefined>(
  undefined
);

export function PlaylistProvider({ children }: { children: ReactNode }) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortType, setSortType] = useState<
    "none" | "alphabetical" | "numberOfSongsDesc" | "numberOfSongsAsc"
  >("none");

  // Fetch playlists on component mount
  useEffect(() => {
    fetchPlaylists();
  }, []);

  // Update search results when query or sort type change
  useEffect(() => {
    fetchPlaylists();
  }, [searchQuery, sortType]);

  // Fetch playlists from the API
  const fetchPlaylists = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (searchQuery) {
        queryParams.append("query", searchQuery);
      }
      if (sortType !== "none") {
        queryParams.append("sort", sortType);
      }

      const response = await fetch(`/api/playlists?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch playlists");
      }
      const data = await response.json();
      setPlaylists(data.playlists);
      setSearchResults(data.playlists);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      console.error("Error fetching playlists:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new playlist
  const addPlaylist = async (
    playlistData: Omit<Playlist, "id" | "createdAt" | "updatedAt">
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/playlists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(playlistData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create playlist");
      }

      // Refresh playlists after adding
      await fetchPlaylists();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      console.error("Error adding playlist:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Update a playlist
  const updatePlaylist = async (
    id: string,
    playlistData: Partial<Playlist>
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("Updating playlist:", id, playlistData);
      const response = await fetch(`/api/playlists/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(playlistData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update playlist");
      }

      // Refresh playlists after updating
      await fetchPlaylists();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      console.error("Error updating playlist:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a playlist
  const deletePlaylist = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/playlists/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete playlist");
      }

      // Refresh playlists after deleting
      await fetchPlaylists();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      console.error("Error deleting playlist:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset playlists to initial state (keep this in case we need it)
  const resetPlaylists = async () => {
    // This is a simplified approach - in a real app, you might want
    // to have a dedicated API endpoint for resetting
    setIsLoading(true);
    setError(null);

    try {
      // First, delete all existing playlists
      await Promise.all(
        playlists.map((playlist) =>
          fetch(`/api/playlists/${playlist.id}`, { method: "DELETE" })
        )
      );

      // Fetch the playlists again (which should now be the defaults from the server)
      await fetchPlaylists();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      console.error("Error resetting playlists:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Add a song to a playlist
  const addSong = async (playlistId: string, song: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/playlists/${playlistId}/songs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(song),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add song");
      }

      // Refresh playlists after adding a song
      await fetchPlaylists();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      console.error("Error adding song:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Update a song in a playlist
  const updateSong = async (playlistId: string, songId: string, song: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/playlists/${playlistId}/songs/${songId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(song),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update song");
      }

      // Refresh playlists after updating a song
      await fetchPlaylists();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      console.error("Error updating song:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a song from a playlist
  const deleteSong = async (playlistId: string, songId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/playlists/${playlistId}/songs/${songId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete song");
      }

      // Refresh playlists after deleting a song
      await fetchPlaylists();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      console.error("Error deleting song:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PlaylistContext.Provider
      value={{
        playlists,
        searchResults,
        searchQuery,
        setSearchQuery,
        addPlaylist,
        updatePlaylist,
        deletePlaylist,
        resetPlaylists,
        addSong,
        updateSong,
        deleteSong,
        isLoading,
        error,
        sortType,
        setSortType,
      }}
    >
      {children}
    </PlaylistContext.Provider>
  );
}

export function usePlaylist() {
  const context = useContext(PlaylistContext);
  if (context === undefined) {
    throw new Error("usePlaylist must be used within a PlaylistProvider");
  }
  return context;
}
