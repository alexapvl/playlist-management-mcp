"use client";

import { useState } from "react";
import { usePlaylist } from "../context/PlaylistContext";

export default function SortDropdown() {
  const { sortType, setSortType } = usePlaylist();
  const [isOpen, setIsOpen] = useState(false);

  const handleSort = (
    type: "none" | "alphabetical" | "numberOfSongsDesc" | "numberOfSongsAsc"
  ) => {
    setSortType(type);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex w-full justify-center gap-x-1.5 rounded-lg p-4 text-sm text-gray-900 border border-gray-300 bg-white focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 min-w-[200px]"
        >
          Sort by:{" "}
          {sortType === "none"
            ? "None"
            : sortType === "alphabetical"
            ? "A-Z"
            : sortType === "numberOfSongsDesc"
            ? "Songs desc."
            : "Songs asc."}
          <svg
            className="-mr-1 h-5 w-5 text-gray-400"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-72 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            <button
              onClick={() => handleSort("none")}
              className={`${
                sortType === "none"
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                  : "text-gray-700 dark:text-gray-300"
              } block w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700`}
            >
              None
            </button>
            <button
              onClick={() => handleSort("alphabetical")}
              className={`${
                sortType === "alphabetical"
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                  : "text-gray-700 dark:text-gray-300"
              } block w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700`}
            >
              Alphabetical (A-Z)
            </button>
            <button
              onClick={() => handleSort("numberOfSongsDesc")}
              className={`${
                sortType === "numberOfSongsDesc"
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                  : "text-gray-700 dark:text-gray-300"
              } block w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700`}
            >
              Number of Songs desc.
            </button>
            <button
              onClick={() => handleSort("numberOfSongsAsc")}
              className={`${
                sortType === "numberOfSongsAsc"
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                  : "text-gray-700 dark:text-gray-300"
              } block w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700`}
            >
              Number of Songs asc.
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
