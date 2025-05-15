// Shared enum definitions that match Prisma schema
export enum ActionType {
  CREATE = "CREATE",
  READ = "READ",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
}

export enum EntityType {
  PLAYLIST = "PLAYLIST",
  SONG = "SONG",
  USER = "USER",
}
