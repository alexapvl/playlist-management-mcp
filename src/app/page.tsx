"use client";

import { useState, useEffect } from "react";
import { Playlist } from "../types";
import { PlaylistProvider, usePlaylist } from "../context/PlaylistContext";
import PlaylistCard from "../components/PlaylistCard";
import SearchBar from "../components/SearchBar";
import PlaylistForm from "../components/PlaylistForm";
import SortDropdown from "../components/SortDropdown";
import PlaylistDashboard from "../components/PlaylistDashboard";

function PlaylistGrid() {
  const { searchResults, playlists } = usePlaylist();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | undefined>(
    undefined
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6); // Plus 1 for the add button
  const [totalPages, setTotalPages] = useState(1);
  const [paginatedPlaylists, setPaginatedPlaylists] = useState<Playlist[]>([]);

  // Reset to first page when playlists or search results change
  useEffect(() => {
    setCurrentPage(1);
  }, [playlists, searchResults]);

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

  // Pagination
  useEffect(() => {
    setTotalPages(Math.ceil(searchResults.length / itemsPerPage));
  }, [searchResults, itemsPerPage]);

  useEffect(() => {
    setPaginatedPlaylists(
      searchResults.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage - 1
      )
    );
  }, [searchResults, currentPage, itemsPerPage]);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  const handleItemsPerPageChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
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
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedPlaylists.map((playlist: Playlist) => (
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
                  <h3 className="text-xl font-semibold mb-2">
                    Add New Playlist
                  </h3>
                  <p className="text-sm text-white text-opacity-80 mb-3">
                    Create a custom playlist with your favorite songs
                  </p>
                </div>
              </div>
            </button>
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-col items-center gap-4 mt-8">
            <select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="border rounded p-2"
            >
              <option value={6}>5 per page</option>
              <option value={11}>10 per page</option>
              <option value={21}>20 per page</option>
              <option value={51}>50 per page</option>
            </select>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
              >
                Previous
              </button>
              <span className="px-4 py-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
              >
                Next
              </button>
            </div>
          </div>
        </>
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
    <main className="min-h-screen flex flex-col">
      <PlaylistGrid />
      <div className="mt-auto w-full">
        <PlaylistDashboard />
      </div>
    </main>
  );
}
