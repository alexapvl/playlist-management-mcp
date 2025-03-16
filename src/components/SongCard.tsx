import { Song } from "../types";

interface SongCardProps {
  song: Song;
  compact?: boolean;
}

export default function SongCard({ song, compact = false }: SongCardProps) {
  // Format the duration from seconds to MM:SS format
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-md flex justify-between items-center">
      <div className="overflow-hidden">
        <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
          {song.title}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {song.artist}
          {!compact && song.album && ` • ${song.album}`}
        </p>
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 ml-2 whitespace-nowrap">
        {formatDuration(song.duration)}
      </div>
    </div>
  );
}
