import React from "react";
import { render, act, waitFor, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { PlaylistProvider, usePlaylist } from "./PlaylistContext";
import { Playlist } from "../types";

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Reset fetch mock before each test
beforeEach(() => {
  mockFetch.mockReset();
});

// More comprehensive test component that uses more of the playlist context
function TestComponent({
  onStateChange,
  onErrorChange,
  onLoadingChange,
}: {
  onStateChange: (playlists: Playlist[]) => void;
  onErrorChange?: (error: string | null) => void;
  onLoadingChange?: (loading: boolean) => void;
}) {
  const {
    playlists,
    searchResults,
    addPlaylist,
    updatePlaylist,
    deletePlaylist,
    setSearchQuery,
    setSortType,
    resetPlaylists,
    addSong,
    updateSong,
    deleteSong,
    isLoading,
    error,
  } = usePlaylist();

  // Call onStateChange whenever playlists or searchResults change
  React.useEffect(() => {
    onStateChange(playlists);
    if (onErrorChange) onErrorChange(error);
    if (onLoadingChange) onLoadingChange(isLoading);
  }, [
    playlists,
    error,
    isLoading,
    onStateChange,
    onErrorChange,
    onLoadingChange,
  ]);

  return (
    <div>
      <div>Loading: {isLoading ? "true" : "false"}</div>
      {error && <div data-testid="error-message">{error}</div>}
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
      <button onClick={() => resetPlaylists()}>Reset Playlists</button>
      <button onClick={() => addSong("1", { id: "s1", title: "Test Song" })}>
        Add Song
      </button>
      <button onClick={() => updateSong("1", "s1", { title: "Updated Song" })}>
        Update Song
      </button>
      <button onClick={() => deleteSong("1", "s1")}>Delete Song</button>
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

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Setup default mock response for initial fetch
    mockFetch.mockImplementation((url) => {
      return Promise.resolve({
        ok: true,
        json: async () => ({ playlists: mockPlaylists }),
      });
    });
  });

  it("should initialize with fetched playlists", async () => {
    const handleStateChange = jest.fn();
    render(
      <PlaylistProvider>
        <TestComponent onStateChange={handleStateChange} />
      </PlaylistProvider>
    );

    await waitFor(() => {
      expect(handleStateChange).toHaveBeenCalledWith(mockPlaylists);
    });

    expect(mockFetch).toHaveBeenCalled();
    const fetchCall = mockFetch.mock.calls[0];
    expect(fetchCall[0]).toContain("/api/playlists");
  });

  it("should add a new playlist", async () => {
    const handleStateChange = jest.fn();
    const { getByText } = render(
      <PlaylistProvider>
        <TestComponent onStateChange={handleStateChange} />
      </PlaylistProvider>
    );

    // Wait for initial fetch to complete
    await waitFor(() => {
      expect(handleStateChange).toHaveBeenCalled();
    });

    // Clear previous mock calls and setup new mock implementation
    mockFetch.mockReset();

    // First response for the create request
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ success: true }),
      })
    );

    // Second response for the subsequent fetch request
    const updatedMockPlaylists = [
      ...mockPlaylists,
      {
        id: "3",
        name: "New Playlist",
        description: "Test playlist",
        coverImage: "test.jpg",
        songs: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ playlists: updatedMockPlaylists }),
      })
    );

    await act(async () => {
      getByText("Add Playlist").click();
    });

    await waitFor(() => {
      const updatedPlaylists =
        handleStateChange.mock.calls[
          handleStateChange.mock.calls.length - 1
        ][0];
      expect(updatedPlaylists.length).toBe(mockPlaylists.length + 1);
      expect(updatedPlaylists[updatedPlaylists.length - 1].name).toBe(
        "New Playlist"
      );
    });

    // Verify API calls
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch.mock.calls[0][0]).toBe("/api/playlists");
    expect(mockFetch.mock.calls[0][1]).toHaveProperty("method", "POST");
  });

  it("should update an existing playlist", async () => {
    const handleStateChange = jest.fn();
    const { getByText } = render(
      <PlaylistProvider>
        <TestComponent onStateChange={handleStateChange} />
      </PlaylistProvider>
    );

    // Wait for initial fetch to complete
    await waitFor(() => {
      expect(handleStateChange).toHaveBeenCalled();
    });

    // Clear previous mock calls and setup new mock implementation
    mockFetch.mockReset();

    // First response for the update request
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ success: true }),
      })
    );

    // Second response for the subsequent fetch request
    const updatedMockPlaylists = mockPlaylists.map((p) =>
      p.id === "1" ? { ...p, name: "Updated Name" } : p
    );

    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ playlists: updatedMockPlaylists }),
      })
    );

    await act(async () => {
      getByText("Update Playlist").click();
    });

    await waitFor(() => {
      const updatedPlaylists =
        handleStateChange.mock.calls[
          handleStateChange.mock.calls.length - 1
        ][0];
      const updatedPlaylist = updatedPlaylists.find(
        (p: Playlist) => p.id === "1"
      );
      expect(updatedPlaylist?.name).toBe("Updated Name");
    });

    // Verify API calls
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch.mock.calls[0][0]).toBe("/api/playlists/1");
    expect(mockFetch.mock.calls[0][1]).toHaveProperty("method", "PATCH");
  });

  it("should delete a playlist", async () => {
    const handleStateChange = jest.fn();
    const { getByText } = render(
      <PlaylistProvider>
        <TestComponent onStateChange={handleStateChange} />
      </PlaylistProvider>
    );

    // Wait for initial fetch to complete
    await waitFor(() => {
      expect(handleStateChange).toHaveBeenCalled();
    });

    // Clear previous mock calls and setup new mock implementation
    mockFetch.mockReset();

    // First response for the delete request
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ success: true }),
      })
    );

    // Second response for the subsequent fetch request
    const filteredMockPlaylists = mockPlaylists.filter((p) => p.id !== "1");

    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ playlists: filteredMockPlaylists }),
      })
    );

    await act(async () => {
      getByText("Delete Playlist").click();
    });

    await waitFor(() => {
      const updatedPlaylists =
        handleStateChange.mock.calls[
          handleStateChange.mock.calls.length - 1
        ][0];
      expect(updatedPlaylists.length).toBe(mockPlaylists.length - 1);
      expect(
        updatedPlaylists.find((p: Playlist) => p.id === "1")
      ).toBeUndefined();
    });

    // Verify API calls
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch.mock.calls[0][0]).toBe("/api/playlists/1");
    expect(mockFetch.mock.calls[0][1]).toHaveProperty("method", "DELETE");
  });

  it("should search playlists", async () => {
    const handleStateChange = jest.fn();
    const { getByText } = render(
      <PlaylistProvider>
        <TestComponent onStateChange={handleStateChange} />
      </PlaylistProvider>
    );

    // Wait for initial fetch to complete
    await waitFor(() => {
      expect(handleStateChange).toHaveBeenCalled();
    });

    // Clear previous mock calls
    mockFetch.mockReset();

    // Setup mock for the search request
    const searchResults = [mockPlaylists[0]]; // Only the first playlist matches
    mockFetch.mockImplementationOnce((url) => {
      return Promise.resolve({
        ok: true,
        json: async () => ({ playlists: searchResults }),
      });
    });

    await act(async () => {
      getByText("Search Playlists").click();
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
      const fetchCall = mockFetch.mock.calls[0];
      expect(fetchCall[0]).toContain("/api/playlists?query=test");
    });
  });

  it("should sort playlists alphabetically", async () => {
    const handleStateChange = jest.fn();
    const { getByText } = render(
      <PlaylistProvider>
        <TestComponent onStateChange={handleStateChange} />
      </PlaylistProvider>
    );

    // Wait for initial fetch to complete
    await waitFor(() => {
      expect(handleStateChange).toHaveBeenCalled();
    });

    // Clear previous mock calls
    mockFetch.mockReset();

    // Setup mock for the sort request
    // In a real API response, these would actually be sorted
    const sortedPlaylists = [
      mockPlaylists[1], // "Another Playlist" - should be first alphabetically
      mockPlaylists[0], // "Test Playlist"
    ];

    mockFetch.mockImplementationOnce((url) => {
      return Promise.resolve({
        ok: true,
        json: async () => ({ playlists: sortedPlaylists }),
      });
    });

    await act(async () => {
      getByText("Sort Alphabetically").click();
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
      const fetchCall = mockFetch.mock.calls[0];
      expect(fetchCall[0]).toContain("/api/playlists?sort=alphabetical");

      const sortedResults =
        handleStateChange.mock.calls[
          handleStateChange.mock.calls.length - 1
        ][0];
      expect(sortedResults[0].name).toBe("Another Playlist");
      expect(sortedResults[1].name).toBe("Test Playlist");
    });
  });

  it("should add a song to a playlist", async () => {
    const handleStateChange = jest.fn();
    const { getByText } = render(
      <PlaylistProvider>
        <TestComponent onStateChange={handleStateChange} />
      </PlaylistProvider>
    );

    // Wait for initial fetch to complete
    await waitFor(() => {
      expect(handleStateChange).toHaveBeenCalled();
    });

    // Clear previous mock calls
    mockFetch.mockReset();

    // Setup mock for the add song request
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ success: true }),
      })
    );

    // Setup mock for the subsequent fetch
    const updatedMockPlaylists = mockPlaylists.map((p: Playlist) =>
      p.id === "1"
        ? {
            ...p,
            songs: [...(p.songs || []), { id: "s1", title: "Test Song" }],
          }
        : p
    );

    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ playlists: updatedMockPlaylists }),
      })
    );

    await act(async () => {
      getByText("Add Song").click();
    });

    await waitFor(() => {
      const updatedPlaylists =
        handleStateChange.mock.calls[
          handleStateChange.mock.calls.length - 1
        ][0];
      const playlist = updatedPlaylists.find((p: Playlist) => p.id === "1");
      expect(playlist?.songs).toHaveLength(1);
      expect(playlist?.songs[0].title).toBe("Test Song");
    });

    // Verify API calls
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch.mock.calls[0][0]).toBe("/api/playlists/1/songs");
    expect(mockFetch.mock.calls[0][1]).toHaveProperty("method", "POST");
  });

  it("should update a song in a playlist", async () => {
    // Add a song to playlist 1 first
    const playlistWithSong = {
      ...mockPlaylists[0],
      songs: [{ id: "s1", title: "Test Song" }],
    };

    const initialPlaylists = [playlistWithSong, mockPlaylists[1]];

    // Override the default mock to include a playlist with a song
    mockFetch.mockReset();
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ playlists: initialPlaylists }),
      })
    );

    const handleStateChange = jest.fn();
    const { getByText } = render(
      <PlaylistProvider>
        <TestComponent onStateChange={handleStateChange} />
      </PlaylistProvider>
    );

    // Wait for initial fetch to complete
    await waitFor(() => {
      expect(handleStateChange).toHaveBeenCalled();
    });

    // Clear previous mock calls
    mockFetch.mockReset();

    // Setup mock for the update song request
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ success: true }),
      })
    );

    // Setup mock for the subsequent fetch
    const updatedPlaylists = [
      {
        ...playlistWithSong,
        songs: [{ id: "s1", title: "Updated Song" }],
      },
      mockPlaylists[1],
    ];

    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ playlists: updatedPlaylists }),
      })
    );

    await act(async () => {
      getByText("Update Song").click();
    });

    await waitFor(() => {
      const resultPlaylists =
        handleStateChange.mock.calls[
          handleStateChange.mock.calls.length - 1
        ][0];
      const playlist = resultPlaylists.find((p: Playlist) => p.id === "1");
      expect(playlist?.songs[0].title).toBe("Updated Song");
    });

    // Verify API calls
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch.mock.calls[0][0]).toBe("/api/playlists/1/songs/s1");
    expect(mockFetch.mock.calls[0][1]).toHaveProperty("method", "PATCH");
  });

  it("should delete a song from a playlist", async () => {
    // Add a song to playlist 1 first
    const playlistWithSong = {
      ...mockPlaylists[0],
      songs: [{ id: "s1", title: "Test Song" }],
    };

    const initialPlaylists = [playlistWithSong, mockPlaylists[1]];

    // Override the default mock to include a playlist with a song
    mockFetch.mockReset();
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ playlists: initialPlaylists }),
      })
    );

    const handleStateChange = jest.fn();
    const { getByText } = render(
      <PlaylistProvider>
        <TestComponent onStateChange={handleStateChange} />
      </PlaylistProvider>
    );

    // Wait for initial fetch to complete
    await waitFor(() => {
      expect(handleStateChange).toHaveBeenCalled();
    });

    // Clear previous mock calls
    mockFetch.mockReset();

    // Setup mock for the delete song request
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ success: true }),
      })
    );

    // Setup mock for the subsequent fetch
    const updatedPlaylists = [
      {
        ...playlistWithSong,
        songs: [], // Song removed
      },
      mockPlaylists[1],
    ];

    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ playlists: updatedPlaylists }),
      })
    );

    await act(async () => {
      getByText("Delete Song").click();
    });

    await waitFor(() => {
      const resultPlaylists =
        handleStateChange.mock.calls[
          handleStateChange.mock.calls.length - 1
        ][0];
      const playlist = resultPlaylists.find((p: Playlist) => p.id === "1");
      expect(playlist?.songs).toHaveLength(0);
    });

    // Verify API calls
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch.mock.calls[0][0]).toBe("/api/playlists/1/songs/s1");
    expect(mockFetch.mock.calls[0][1]).toHaveProperty("method", "DELETE");
  });

  it("should handle API errors when adding a playlist", async () => {
    const handleStateChange = jest.fn();
    const handleErrorChange = jest.fn();
    const { getByText } = render(
      <PlaylistProvider>
        <TestComponent
          onStateChange={handleStateChange}
          onErrorChange={handleErrorChange}
        />
      </PlaylistProvider>
    );

    // Wait for initial fetch to complete
    await waitFor(() => {
      expect(handleStateChange).toHaveBeenCalled();
    });

    // Clear previous mock calls and error handlers
    mockFetch.mockReset();
    handleErrorChange.mockReset();

    // Setup error response for add request
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 400,
        json: async () => ({ error: "Invalid playlist data" }),
      })
    );

    await act(async () => {
      getByText("Add Playlist").click();
    });

    await waitFor(() => {
      expect(handleErrorChange).toHaveBeenCalledWith("Invalid playlist data");
    });
  });

  it("should handle errors when updating a playlist", async () => {
    const handleStateChange = jest.fn();
    const handleErrorChange = jest.fn();
    const { getByText } = render(
      <PlaylistProvider>
        <TestComponent
          onStateChange={handleStateChange}
          onErrorChange={handleErrorChange}
        />
      </PlaylistProvider>
    );

    // Wait for initial fetch to complete
    await waitFor(() => {
      expect(handleStateChange).toHaveBeenCalled();
    });

    // Clear previous mock calls and error handlers
    mockFetch.mockReset();
    handleErrorChange.mockReset();

    // Setup error response for update request
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 400,
        json: async () => ({ error: "Invalid playlist update" }),
      })
    );

    await act(async () => {
      getByText("Update Playlist").click();
    });

    await waitFor(() => {
      expect(handleErrorChange).toHaveBeenCalledWith("Invalid playlist update");
    });
  });

  it("should handle errors when deleting a playlist", async () => {
    const handleStateChange = jest.fn();
    const handleErrorChange = jest.fn();
    const { getByText } = render(
      <PlaylistProvider>
        <TestComponent
          onStateChange={handleStateChange}
          onErrorChange={handleErrorChange}
        />
      </PlaylistProvider>
    );

    // Wait for initial fetch to complete
    await waitFor(() => {
      expect(handleStateChange).toHaveBeenCalled();
    });

    // Clear previous mock calls and error handlers
    mockFetch.mockReset();
    handleErrorChange.mockReset();

    // Setup error response for delete request
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 404,
        json: async () => ({ error: "Playlist not found" }),
      })
    );

    await act(async () => {
      getByText("Delete Playlist").click();
    });

    await waitFor(() => {
      expect(handleErrorChange).toHaveBeenCalledWith("Playlist not found");
    });
  });
});
