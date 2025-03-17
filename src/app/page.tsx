"use client";

import { useState } from "react";
import { Playlist } from "../types";
import { PlaylistProvider, usePlaylist } from "../context/PlaylistContext";
import PlaylistCard from "../components/PlaylistCard";
import SearchBar from "../components/SearchBar";
import PlaylistForm from "../components/PlaylistForm";
import SortDropdown from "../components/SortDropdown";

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

      <div className="flex items-center gap-4 mb-8">
        <div className="flex-grow">
          <SearchBar />
        </div>
        <div className="w-48">
          <SortDropdown />
        </div>
      </div>

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
            className="add-playlist-button h-full flex flex-col rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg"
          >
            <div className="h-full w-full flex items-center justify-center">
              <div className="flex flex-col items-center justify-center text-center">
                <svg
                  className="w-16 h-16"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  ></path>
                </svg>
                <h3 className="text-xl font-semibold mb-2">Add New Playlist</h3>
                <p className="text-sm text-white text-opacity-80 mb-3">
                  Create a custom playlist with your favorite songs
                </p>
              </div>
            </div>
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
            className="add-playlist-button px-6 py-3 rounded-md text-white font-medium"
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
