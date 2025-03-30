"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { Playlist } from "../types";
import { mockPlaylists } from "../data/playlists";
import { v4 as uuidv4 } from "uuid";

interface PlaylistContextType {
  playlists: Playlist[];
  searchResults: Playlist[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  addPlaylist: (
    playlist: Omit<Playlist, "id" | "createdAt" | "updatedAt">
  ) => void;
  updatePlaylist: (id: string, playlist: Partial<Playlist>) => void;
  deletePlaylist: (id: string) => void;
  resetPlaylists: () => void;
  sortType: "none" | "alphabetical" | "numberOfSongsDesc" | "numberOfSongsAsc";
  setSortType: (
    type: "none" | "alphabetical" | "numberOfSongsDesc" | "numberOfSongsAsc"
  ) => void;
}

const PlaylistContext = createContext<PlaylistContextType | undefined>(
  undefined
);

export function PlaylistProvider({
  children,
  initialPlaylists = [],
}: {
  children: ReactNode;
  initialPlaylists?: Playlist[];
}) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Playlist[]>([]);
  const [sortType, setSortType] = useState<
    "none" | "alphabetical" | "numberOfSongsDesc" | "numberOfSongsAsc"
  >("none");

  // Initialize with provided playlists or mock data
  useEffect(() => {
    setPlaylists(
      initialPlaylists.length > 0 ? initialPlaylists : mockPlaylists
    );
  }, []);

  // Update search results when query, playlists, or sort type change
  useEffect(() => {
    let filtered = playlists;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (playlist) =>
          playlist.name.toLowerCase().includes(query) ||
          playlist.description.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    if (sortType === "alphabetical") {
      filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    }

    if (sortType === "numberOfSongsDesc") {
      filtered = [...filtered].sort((a, b) => b.songs.length - a.songs.length);
    }

    if (sortType === "numberOfSongsAsc") {
      filtered = [...filtered].sort((a, b) => a.songs.length - b.songs.length);
    }

    setSearchResults(filtered);
  }, [searchQuery, playlists, sortType]);

  const addPlaylist = (
    playlistData: Omit<Playlist, "id" | "createdAt" | "updatedAt">
  ) => {
    const newPlaylist: Playlist = {
      ...playlistData,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setPlaylists((prev) => [...prev, newPlaylist]);
  };

  const updatePlaylist = (id: string, playlistData: Partial<Playlist>) => {
    setPlaylists((prev) =>
      prev.map((playlist) =>
        playlist.id === id
          ? { ...playlist, ...playlistData, updatedAt: new Date() }
          : playlist
      )
    );
  };

  const deletePlaylist = (id: string) => {
    setPlaylists((prev) => prev.filter((playlist) => playlist.id !== id));
  };

  const resetPlaylists = () => {
    setPlaylists(mockPlaylists);
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
