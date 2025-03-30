import { useState, useEffect } from "react";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Playlist } from "../types";
import { usePlaylist } from "../context/PlaylistContext";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function PlaylistDashboard() {
  const { playlists } = usePlaylist();
  const [chartData, setChartData] = useState<any>(null);

  // Update chart data whenever playlists change
  useEffect(() => {
    if (playlists.length === 0) return;

    const updateChartData = () => {
      // Songs per playlist chart
      const songsPerPlaylist = {
        labels: playlists.map((p) => p.name),
        datasets: [
          {
            label: "Number of Songs",
            data: playlists.map((p) => p.songs.length),
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderColor: "rgba(75, 192, 192, 1)",
          },
        ],
      };

      // Average duration per playlist
      const avgDurationPerPlaylist = {
        labels: playlists.map((p) => p.name),
        datasets: [
          {
            label: "Average Duration (minutes)",
            data: playlists.map(
              (p) =>
                p.songs.reduce((acc, song) => acc + song.duration, 0) /
                60 /
                p.songs.length
            ),
            backgroundColor: "rgba(153, 102, 255, 0.2)",
            borderColor: "rgba(153, 102, 255, 1)",
          },
        ],
      };

      // Artist distribution
      const artistCounts = playlists
        .flatMap((p) => p.songs.map((s) => s.artist))
        .reduce((acc, artist) => {
          acc[artist] = (acc[artist] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

      const topArtists = Object.entries(artistCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

      const artistDistribution = {
        labels: topArtists.map(([artist]) => artist),
        datasets: [
          {
            data: topArtists.map(([, count]) => count),
            backgroundColor: [
              "rgba(255, 99, 132, 0.2)",
              "rgba(54, 162, 235, 0.2)",
              "rgba(255, 206, 86, 0.2)",
              "rgba(75, 192, 192, 0.2)",
              "rgba(153, 102, 255, 0.2)",
            ],
            borderColor: [
              "rgba(255, 99, 132, 1)",
              "rgba(54, 162, 235, 1)",
              "rgba(255, 206, 86, 1)",
              "rgba(75, 192, 192, 1)",
              "rgba(153, 102, 255, 1)",
            ],
          },
        ],
      };

      setChartData({
        songsPerPlaylist,
        avgDurationPerPlaylist,
        artistDistribution,
      });
    };

    updateChartData();
  }, [playlists]);

  return (
    <div className="w-full px-2 py-6">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-white">
        Dashboard Analytics
      </h2>

      {/* Charts Section */}
      {chartData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-8 mx-0">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex items-center justify-center">
            <div className="w-full max-w-md">
              <Bar
                data={chartData.songsPerPlaylist}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  color: "white",
                  plugins: {
                    legend: {
                      labels: {
                        color: "white",
                      },
                    },
                  },
                  scales: {
                    x: {
                      ticks: { color: "white" },
                      grid: { color: "rgba(255, 255, 255, 0.1)" },
                    },
                    y: {
                      ticks: { color: "white" },
                      grid: { color: "rgba(255, 255, 255, 0.1)" },
                    },
                  },
                }}
              />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex items-center justify-center">
            <div className="w-full max-w-md">
              <Line
                data={chartData.avgDurationPerPlaylist}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  color: "white",
                  plugins: {
                    legend: {
                      labels: {
                        color: "white",
                      },
                    },
                  },
                  scales: {
                    x: {
                      ticks: { color: "white" },
                      grid: { color: "rgba(255, 255, 255, 0.1)" },
                    },
                    y: {
                      ticks: { color: "white" },
                      grid: { color: "rgba(255, 255, 255, 0.1)" },
                    },
                  },
                }}
              />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex items-center justify-center">
            <div className="w-full max-w-md">
              <Doughnut
                data={chartData.artistDistribution}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: {
                    legend: {
                      labels: {
                        color: "white",
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
