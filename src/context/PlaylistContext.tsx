"use client";

import {
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
}

const PlaylistContext = createContext<PlaylistContextType | undefined>(
  undefined
);

export function PlaylistProvider({ children }: { children: ReactNode }) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Playlist[]>([]);

  // Initialize with mock data
  useEffect(() => {
    setPlaylists(mockPlaylists);
  }, []);

  // Update search results when query or playlists change
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(playlists);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = playlists.filter(
      (playlist) =>
        playlist.name.toLowerCase().includes(query) ||
        playlist.description.toLowerCase().includes(query)
    );
    setSearchResults(filtered);
  }, [searchQuery, playlists]);

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
