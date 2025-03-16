import { Playlist } from "../types";

// Mock data for playlists
export const mockPlaylists: Playlist[] = [
  {
    id: "1",
    name: "Workout Mix",
    description: "High energy songs to keep you motivated during workouts",
    coverImage:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop",
    songs: [
      {
        id: "101",
        title: "Eye of the Tiger",
        artist: "Survivor",
        duration: 245,
      },
      {
        id: "102",
        title: "Stronger",
        artist: "Kanye West",
        duration: 312,
      },
      {
        id: "103",
        title: "Till I Collapse",
        artist: "Eminem",
        duration: 298,
      },
    ],
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2023-03-20"),
  },
  {
    id: "2",
    name: "Chill Vibes",
    description: "Relaxing tunes for unwinding after a long day",
    coverImage:
      "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&h=500&fit=crop",
    songs: [
      {
        id: "201",
        title: "Waves",
        artist: "Chill Harris",
        duration: 267,
      },
      {
        id: "202",
        title: "Midnight City",
        artist: "M83",
        duration: 244,
      },
      {
        id: "203",
        title: "Intro",
        artist: "The xx",
        duration: 128,
      },
    ],
    createdAt: new Date("2023-02-10"),
    updatedAt: new Date("2023-02-10"),
  },
  {
    id: "3",
    name: "Road Trip",
    description: "Perfect soundtrack for long drives",
    coverImage:
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500&h=500&fit=crop",
    songs: [
      {
        id: "301",
        title: "Take It Easy",
        artist: "Eagles",
        duration: 187,
      },
      {
        id: "302",
        title: "Life is a Highway",
        artist: "Tom Cochrane",
        duration: 265,
      },
      {
        id: "303",
        title: "On the Road Again",
        artist: "Willie Nelson",
        duration: 150,
      },
    ],
    createdAt: new Date("2023-03-05"),
    updatedAt: new Date("2023-04-12"),
  },
  {
    id: "4",
    name: "Classical Masterpieces",
    description: "Timeless classical compositions from the greatest composers",
    coverImage:
      "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=500&h=500&fit=crop",
    songs: [
      {
        id: "401",
        title: "Symphony No. 5 in C minor",
        artist: "Ludwig van Beethoven",
        album: "Beethoven: Symphonies",
        duration: 425,
      },
      {
        id: "402",
        title: "The Four Seasons - Spring",
        artist: "Antonio Vivaldi",
        album: "The Four Seasons",
        duration: 218,
      },
      {
        id: "403",
        title: "Moonlight Sonata",
        artist: "Ludwig van Beethoven",
        album: "Piano Sonatas",
        duration: 376,
      },
      {
        id: "404",
        title: "Eine kleine Nachtmusik",
        artist: "Wolfgang Amadeus Mozart",
        album: "Mozart: Serenades",
        duration: 312,
      },
      {
        id: "405",
        title: "Clair de Lune",
        artist: "Claude Debussy",
        album: "Suite Bergamasque",
        duration: 290,
      },
      {
        id: "406",
        title: "Ride of the Valkyries",
        artist: "Richard Wagner",
        album: "Die Walküre",
        duration: 320,
      },
      {
        id: "407",
        title: "Canon in D",
        artist: "Johann Pachelbel",
        album: "Baroque Favorites",
        duration: 345,
      },
    ],
    createdAt: new Date("2023-05-20"),
    updatedAt: new Date("2023-06-15"),
  },
  {
    id: "5",
    name: "EDM Festival Hits",
    description:
      "Electronic dance music anthems perfect for the festival season",
    coverImage:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&h=500&fit=crop",
    songs: [
      {
        id: "501",
        title: "Strobe",
        artist: "Deadmau5",
        album: "For Lack of a Better Name",
        duration: 598,
      },
      {
        id: "502",
        title: "Levels",
        artist: "Avicii",
        album: "True",
        duration: 210,
      },
      {
        id: "503",
        title: "Titanium",
        artist: "David Guetta ft. Sia",
        album: "Nothing but the Beat",
        duration: 245,
      },
      {
        id: "504",
        title: "Clarity",
        artist: "Zedd ft. Foxes",
        album: "Clarity",
        duration: 271,
      },
      {
        id: "505",
        title: "Don't You Worry Child",
        artist: "Swedish House Mafia",
        album: "Until Now",
        duration: 212,
      },
      {
        id: "506",
        title: "Animals",
        artist: "Martin Garrix",
        album: "Gold Skies EP",
        duration: 185,
      },
      {
        id: "507",
        title: "Lean On",
        artist: "Major Lazer & DJ Snake ft. MØ",
        album: "Peace Is The Mission",
        duration: 176,
      },
      {
        id: "508",
        title: "Bangarang",
        artist: "Skrillex ft. Sirah",
        album: "Bangarang EP",
        duration: 215,
      },
    ],
    createdAt: new Date("2023-04-10"),
    updatedAt: new Date("2023-07-05"),
  },
];

// Helper functions for CRUD operations
export const getPlaylists = () => mockPlaylists;

export const getPlaylistById = (id: string) => {
  return mockPlaylists.find((playlist) => playlist.id === id);
};

export const searchPlaylists = (query: string) => {
  const lowercaseQuery = query.toLowerCase();
  return mockPlaylists.filter(
    (playlist) =>
      playlist.name.toLowerCase().includes(lowercaseQuery) ||
      playlist.description.toLowerCase().includes(lowercaseQuery)
  );
};
