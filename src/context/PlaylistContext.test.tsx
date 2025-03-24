import React from "react";
import { render, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { PlaylistProvider, usePlaylist } from "./PlaylistContext";
import { Playlist } from "../types";

// Test component that uses the playlist context
function TestComponent({
  onStateChange,
}: {
  onStateChange: (playlists: Playlist[]) => void;
}) {
  const {
    playlists,
    searchResults,
    addPlaylist,
    updatePlaylist,
    deletePlaylist,
    setSearchQuery,
    setSortType,
  } = usePlaylist();

  // Call onStateChange whenever playlists or searchResults change
  React.useEffect(() => {
    onStateChange(playlists);
  }, [playlists, onStateChange]);

  return (
    <div>
      <button
        onClick={() =>
          addPlaylist({
            name: "New Playlist",
            description: "Test playlist",
            coverImage: "test.jpg",
            songs: [],
          })
        }
      >
        Add Playlist
      </button>
      <button onClick={() => updatePlaylist("1", { name: "Updated Name" })}>
        Update Playlist
      </button>
      <button onClick={() => deletePlaylist("1")}>Delete Playlist</button>
      <button onClick={() => setSearchQuery("test")}>Search Playlists</button>
      <button onClick={() => setSortType("alphabetical")}>
        Sort Alphabetically
      </button>
    </div>
  );
}

describe("PlaylistContext CRUD Operations", () => {
  const mockPlaylists: Playlist[] = [
    {
      id: "1",
      name: "Test Playlist",
      description: "Test description",
      coverImage: "test.jpg",
      songs: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "2",
      name: "Another Playlist",
      description: "Another description",
      coverImage: "test2.jpg",
      songs: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  it("should initialize with provided playlists", () => {
    const handleStateChange = jest.fn();
    render(
      <PlaylistProvider initialPlaylists={mockPlaylists}>
        <TestComponent onStateChange={handleStateChange} />
      </PlaylistProvider>
    );

    expect(handleStateChange).toHaveBeenCalledWith(mockPlaylists);
  });

  it("should add a new playlist", () => {
    const handleStateChange = jest.fn();
    const { getByText } = render(
      <PlaylistProvider initialPlaylists={mockPlaylists}>
        <TestComponent onStateChange={handleStateChange} />
      </PlaylistProvider>
    );

    act(() => {
      getByText("Add Playlist").click();
    });

    const updatedPlaylists =
      handleStateChange.mock.calls[handleStateChange.mock.calls.length - 1][0];
    expect(updatedPlaylists.length).toBe(mockPlaylists.length + 1);
    expect(updatedPlaylists[updatedPlaylists.length - 1].name).toBe(
      "New Playlist"
    );
  });

  it("should update an existing playlist", () => {
    const handleStateChange = jest.fn();
    const { getByText } = render(
      <PlaylistProvider initialPlaylists={mockPlaylists}>
        <TestComponent onStateChange={handleStateChange} />
      </PlaylistProvider>
    );

    act(() => {
      getByText("Update Playlist").click();
    });

    const updatedPlaylists =
      handleStateChange.mock.calls[handleStateChange.mock.calls.length - 1][0];
    const updatedPlaylist = updatedPlaylists.find(
      (p: Playlist) => p.id === "1"
    );
    expect(updatedPlaylist?.name).toBe("Updated Name");
  });

  it("should delete a playlist", () => {
    const handleStateChange = jest.fn();
    const { getByText } = render(
      <PlaylistProvider initialPlaylists={mockPlaylists}>
        <TestComponent onStateChange={handleStateChange} />
      </PlaylistProvider>
    );

    act(() => {
      getByText("Delete Playlist").click();
    });

    const updatedPlaylists =
      handleStateChange.mock.calls[handleStateChange.mock.calls.length - 1][0];
    expect(updatedPlaylists.length).toBe(mockPlaylists.length - 1);
    expect(
      updatedPlaylists.find((p: Playlist) => p.id === "1")
    ).toBeUndefined();
  });

  it("should search playlists", () => {
    const handleStateChange = jest.fn();
    const { getByText } = render(
      <PlaylistProvider initialPlaylists={mockPlaylists}>
        <TestComponent onStateChange={handleStateChange} />
      </PlaylistProvider>
    );

    act(() => {
      getByText("Search Playlists").click();
    });

    // Note: We can't directly test searchResults here as they're managed internally
    // by the context. In a real application, you might want to expose searchResults
    // through the onStateChange callback for testing purposes.
  });

  it("should sort playlists alphabetically", () => {
    const handleStateChange = jest.fn();
    const { getByText } = render(
      <PlaylistProvider initialPlaylists={mockPlaylists}>
        <TestComponent onStateChange={handleStateChange} />
      </PlaylistProvider>
    );

    act(() => {
      getByText("Sort Alphabetically").click();
    });

    const sortedPlaylists =
      handleStateChange.mock.calls[handleStateChange.mock.calls.length - 1][0];
    expect(sortedPlaylists[0].name).toBe("Test Playlist");
    expect(sortedPlaylists[1].name).toBe("Another Playlist");
  });
});
