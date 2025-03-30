"use client";

import { useState, useEffect } from "react";
import { Playlist, Song } from "../types";
import { usePlaylist } from "../context/PlaylistContext";

interface PlaylistFormProps {
  playlist?: Playlist;
  onClose: () => void;
}

export default function PlaylistForm({ playlist, onClose }: PlaylistFormProps) {
  const { addPlaylist, updatePlaylist, isLoading, error } = usePlaylist();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [songs, setSongs] = useState<Song[]>([]);
  const [newSong, setNewSong] = useState({
    title: "",
    artist: "",
    album: "",
    duration: 0,
    durationMinutes: "" as string,
    durationSeconds: "" as string,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Lock body scroll when form is mounted
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  // If editing an existing playlist, populate the form
  useEffect(() => {
    if (playlist) {
      setName(playlist.name);
      setDescription(playlist.description);
      setCoverImage(playlist.coverImage || "");
      setSongs([...playlist.songs]);
    }
  }, [playlist]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Playlist name is required";
    }

    if (!description.trim()) {
      newErrors.description = "Description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const playlistData = {
      name,
      description,
      coverImage: coverImage || undefined,
      songs,
    };

    try {
      if (playlist) {
        // Update existing playlist
        await updatePlaylist(playlist.id, playlistData);
      } else {
        // Add new playlist
        await addPlaylist(playlistData);
      }

      // Close the form only if the operation succeeded
      onClose();
    } catch (err) {
      // Error handling is now managed by the context
      console.error("Form submission error:", err);
    }
  };

  const handleAddSong = () => {
    if (newSong.title && newSong.artist) {
      const minutes = parseInt(String(newSong.durationMinutes)) || 0;
      const seconds = parseInt(String(newSong.durationSeconds)) || 0;
      const totalDuration = minutes * 60 + seconds;

      const song: Song = {
        id: Date.now().toString(),
        title: newSong.title,
        artist: newSong.artist,
        album: newSong.album || undefined,
        duration: totalDuration,
      };

      setSongs([...songs, song]);
      setNewSong({
        title: "",
        artist: "",
        album: "",
        duration: 0,
        durationMinutes: "",
        durationSeconds: "",
      });
    }
  };

  const handleRemoveSong = (id: string) => {
    setSongs(songs.filter((song) => song.id !== id));
  };

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-black/30 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slideIn">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          {playlist ? "Edit Playlist" : "Create New Playlist"}
        </h2>

        {/* Display API error if present */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            Error: {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
              htmlFor="name"
            >
              Playlist Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.name
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
              placeholder="My Awesome Playlist"
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
              htmlFor="description"
            >
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.description
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
              rows={3}
              placeholder="Describe your playlist..."
              disabled={isLoading}
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">{errors.description}</p>
            )}
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
              htmlFor="coverImage"
            >
              Cover Image URL (optional)
            </label>
            <input
              id="coverImage"
              type="text"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="https://example.com/image.jpg"
              disabled={isLoading}
            />
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
              Songs
            </h3>

            {songs.length > 0 ? (
              <div className="max-h-48 overflow-y-auto pr-2 custom-scrollbar mb-4">
                <div className="space-y-2">
                  {songs.map((song) => (
                    <div
                      key={song.id}
                      className="bg-gray-50 dark:bg-gray-700 p-2 rounded-md flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">
                          {song.title}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {song.artist} {song.album && `• ${song.album}`}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSong(song.id)}
                        className="text-red-500 hover:text-red-700 hover:border hover:border-red-700 px-2 py-1 rounded transition-all duration-300 transform hover:scale-105"
                        disabled={isLoading}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No songs added yet.
              </p>
            )}

            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
              <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Add a Song
              </h4>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <input
                  type="text"
                  value={newSong.title}
                  onChange={(e) =>
                    setNewSong({ ...newSong, title: e.target.value })
                  }
                  placeholder="Song title"
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                  disabled={isLoading}
                />
                <input
                  type="text"
                  value={newSong.artist}
                  onChange={(e) =>
                    setNewSong({ ...newSong, artist: e.target.value })
                  }
                  placeholder="Artist"
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                  disabled={isLoading}
                />
              </div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <input
                  type="text"
                  value={newSong.album}
                  onChange={(e) =>
                    setNewSong({ ...newSong, album: e.target.value })
                  }
                  placeholder="Album (optional)"
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                />
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    min="0"
                    value={newSong.durationMinutes}
                    onChange={(e) =>
                      setNewSong({
                        ...newSong,
                        durationMinutes: e.target.value,
                      })
                    }
                    placeholder="Min (optional)"
                    className="w-1/2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                  />
                  <span className="text-gray-700 dark:text-gray-300">:</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={newSong.durationSeconds}
                    onChange={(e) =>
                      setNewSong({
                        ...newSong,
                        durationSeconds: e.target.value,
                      })
                    }
                    placeholder="Sec (optional)"
                    className="w-1/2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                    disabled={isLoading}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddSong}
                className="w-full px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={isLoading || !newSong.title || !newSong.artist}
              >
                Add Song
              </button>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:bg-blue-300 flex items-center justify-center min-w-[80px]"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
              ) : null}
              {isLoading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
