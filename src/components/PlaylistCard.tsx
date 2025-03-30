"use client";

import { useState } from "react";
import Image from "next/image";
import { Playlist } from "../types";
import { usePlaylist } from "../context/PlaylistContext";
import SongCard from "./SongCard";

interface PlaylistCardProps {
  playlist: Playlist;
  onEdit: (playlist: Playlist) => void;
}

export default function PlaylistCard({ playlist, onEdit }: PlaylistCardProps) {
  const { deletePlaylist } = usePlaylist();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    setIsDeleting(true);
    // Add a small delay to show the deleting state
    setTimeout(() => {
      deletePlaylist(playlist.id);
      setIsDeleting(false);
    }, 250);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg h-full flex flex-col">
      <div className="relative h-48 w-full">
        {playlist.coverImage ? (
          <Image
            src={playlist.coverImage}
            alt={playlist.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-r from-purple-400 to-indigo-500 flex items-center justify-center">
            <span className="text-white text-2xl font-bold">
              {playlist.name.charAt(0)}
            </span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <div className="flex-grow">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            {playlist.name}
          </h3>

          <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
            {playlist.description}
          </p>

          {/* Song list section */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Songs:
            </h4>
            <div className="max-h-48 overflow-y-auto pr-2 custom-scrollbar space-y-2">
              {playlist.songs.map((song) => (
                <SongCard key={song.id} song={song} compact={true} />
              ))}
              {playlist.songs.length === 0 && (
                <p className="text-xs italic text-gray-500 dark:text-gray-400">
                  No songs in this playlist
                </p>
              )}
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-blue-100 dark:bg-blue-800/30 p-2 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Duration
              </p>
              <p className="text-sm font-semibold">
                {formatDuration(
                  playlist.songs.reduce(
                    (total, song) => total + song.duration,
                    0
                  )
                )}
              </p>
            </div>
            <div className="bg-purple-100 dark:bg-purple-800/30 p-2 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Unique Artists
              </p>
              <p className="text-sm font-semibold">
                {new Set(playlist.songs.map((song) => song.artist)).size}
              </p>
            </div>
            <div className="bg-green-100 dark:bg-green-800/30 p-2 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400">Songs</p>
              <p className="text-sm font-semibold">{playlist.songs.length}</p>
            </div>
          </div>
        </div>

        {/* Footer section - always at bottom */}
        <div className="mt-auto">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            <p>Last Updated: {formatDate(playlist.updatedAt)}</p>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => onEdit(playlist)}
              className="px-3 py-1.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors text-sm"
            >
              Edit
            </button>

            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className={`px-3 py-1.5 rounded-full transition-colors text-sm ${
                isDeleting
                  ? "bg-gray-400 text-gray-200"
                  : "bg-red-500 text-white hover:bg-red-600"
              }`}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
