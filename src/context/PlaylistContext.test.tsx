import React, { useEffect } from "react";
import { render, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { PlaylistProvider, usePlaylist } from "./PlaylistContext";
import { Playlist } from "../types";

// Test component that uses the playlist context
function TestComponent({
  onSort,
}: {
  onSort: (playlists: Playlist[]) => void;
}) {
  const { searchResults, setSortType } = usePlaylist();

  // Call onSort whenever searchResults changes
  useEffect(() => {
    onSort(searchResults);
  }, [searchResults, onSort]);

  return (
    <button onClick={() => setSortType("alphabetical")}>
      Sort Alphabetically
    </button>
  );
}

describe("PlaylistContext sorting", () => {
  it("should sort playlists alphabetically when sort type is set to alphabetical", () => {
    // Mock playlists with different names
    const mockPlaylists: Playlist[] = [
      {
        id: "1",
        name: "Zebra Tunes",
        description: "Test playlist 1",
        songs: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "2",
        name: "Apple Beats",
        description: "Test playlist 2",
        songs: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "3",
        name: "Middle Songs",
        description: "Test playlist 3",
        songs: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Create a mock function to capture sorted results
    const handleSort = jest.fn();

    // Render the test component within the provider
    render(
      <PlaylistProvider initialPlaylists={mockPlaylists}>
        <TestComponent onSort={handleSort} />
      </PlaylistProvider>
    );

    // Simulate clicking the sort button
    act(() => {
      document.querySelector("button")?.click();
    });

    // Get the latest call to handleSort
    const sortedPlaylists =
      handleSort.mock.calls[handleSort.mock.calls.length - 1][0];

    // Verify the playlists are sorted alphabetically
    expect(sortedPlaylists[0].name).toBe("Apple Beats");
    expect(sortedPlaylists[1].name).toBe("Middle Songs");
    expect(sortedPlaylists[2].name).toBe("Zebra Tunes");
  });
});
