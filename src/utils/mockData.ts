import { faker } from "@faker-js/faker";
import { Playlist } from "../types";

export const generateMockPlaylist = (): Playlist => {
  return {
    id: faker.string.uuid(),
    name: faker.music.songName(),
    description: faker.lorem.sentence(),
    songs: Array.from(
      { length: faker.number.int({ min: 3, max: 15 }) },
      () => ({
        id: faker.string.uuid(),
        title: faker.music.songName(),
        artist: faker.person.fullName(),
        duration: faker.number.int({ min: 120, max: 480 }), // 2-8 minutes
        albumArt: faker.image.urlLoremFlickr({ category: "album" }),
      })
    ),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  };
};

export const generateMockPlaylists = (count: number) => {
  return Array.from({ length: count }, generateMockPlaylist);
};
