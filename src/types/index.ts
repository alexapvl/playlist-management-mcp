export interface Playlist {
  id: string;
  name: string;
  description: string;
  coverImage?: string;
  songs: Song[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number; // in seconds
}
