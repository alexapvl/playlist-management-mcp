// Script to update the songCount field for all existing playlists
const { PrismaClient } = require('./src/generated/prisma');
const prisma = new PrismaClient();

async function updateSongCounts() {
  console.log('Starting song count update...');
  
  try {
    // Get all playlists
    const playlists = await prisma.playlist.findMany({
      select: {
        id: true,
      },
    });
    
    console.log(`Found ${playlists.length} playlists to update`);
    
    // Update each playlist's songCount
    for (const playlist of playlists) {
      // Count songs for this playlist
      const songCount = await prisma.song.count({
        where: { playlistId: playlist.id },
      });
      
      // Update the playlist with the correct song count
      await prisma.playlist.update({
        where: { id: playlist.id },
        data: { songCount },
      });
      
      console.log(`Updated playlist ${playlist.id} with song count: ${songCount}`);
    }
    
    console.log('Update completed successfully!');
  } catch (error) {
    console.error('Error updating song counts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update
updateSongCounts(); 