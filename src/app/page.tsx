"use client";

import { useState } from "react";
import { Playlist } from "../types";
import { PlaylistProvider, usePlaylist } from "../context/PlaylistContext";
import PlaylistCard from "../components/PlaylistCard";
import SearchBar from "../components/SearchBar";
import PlaylistForm from "../components/PlaylistForm";

function PlaylistGrid() {
  const { searchResults } = usePlaylist();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | undefined>(
    undefined
  );

  const handleAddPlaylist = () => {
    setEditingPlaylist(undefined);
    setIsFormOpen(true);
  };

  const handleEditPlaylist = (playlist: Playlist) => {
    setEditingPlaylist(playlist);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingPlaylist(undefined);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-white">
        My Playlists
      </h1>

      <SearchBar />

      {searchResults.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {searchResults.map((playlist: Playlist) => (
            <PlaylistCard
              key={playlist.id}
              playlist={playlist}
              onEdit={handleEditPlaylist}
            />
          ))}

          <button
            onClick={handleAddPlaylist}
            className="h-64 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex flex-col items-center justify-center p-6 transition-colors hover:border-blue-500 dark:hover:border-blue-400"
          >
            <svg
              className="w-12 h-12 text-gray-400 dark:text-gray-600 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              ></path>
            </svg>
            <span className="text-gray-600 dark:text-gray-400 font-medium">
              Add New Playlist
            </span>
          </button>
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
            No playlists found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {searchResults.length === 0
              ? "Let's create a playlist to your liking!"
              : "No playlists match your search."}
          </p>
          <button
            onClick={handleAddPlaylist}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Create Playlist
          </button>
        </div>
      )}

      {isFormOpen && (
        <PlaylistForm playlist={editingPlaylist} onClose={handleCloseForm} />
      )}
    </div>
  );
}

export default function Home() {
  return (
    <PlaylistProvider>
      <PlaylistGrid />
    </PlaylistProvider>
  );
}
