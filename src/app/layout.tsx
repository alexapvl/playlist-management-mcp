import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PlaylistProvider } from "../context/PlaylistContext";
import { AuthProvider } from "../context/auth-context";
import Header from "@/components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Playlist Management App",
  description: "Manage your music playlists with ease",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen`}
      >
        <AuthProvider>
          <PlaylistProvider>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow">{children}</main>
            </div>
          </PlaylistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
