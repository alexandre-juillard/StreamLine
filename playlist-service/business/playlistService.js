const Playlist = require('../data/playlistModel');

// Verify that a song exists by calling catalog-service REST API
const verifySongExists = async (songId) => {
    const response = await fetch(`${process.env.CATALOG_SERVICE_URL}/catalog/${songId}`);
    if (!response.ok) {
        throw new Error('Song not found in catalog');
    }
    return await response.json();
};

// Create a new playlist for a user
const createPlaylist = async (name, ownerId) => {
    const playlist = new Playlist({ name, owner: ownerId });
    return await playlist.save();
};

// Retrieve all playlists
const getAllPlaylists = async () => {
    return await Playlist.find();
};

// Retrieve a playlist by its ID
const getPlaylistById = async (id) => {
    const playlist = await Playlist.findById(id);
    if (!playlist) {
        throw new Error('Playlist not found');
    }
    return playlist;
};

// Enrich a playlist with song details from catalog-service
const enrichPlaylistWithSongs = async (playlist) => {
    const enrichedSongs = await Promise.all(
        playlist.songs.map(async (songId) => {
            try {
                const response = await fetch(`${process.env.CATALOG_SERVICE_URL}/catalog/${songId}`);
                if (response.ok) {
                    return await response.json();
                }
                return { _id: songId, error: 'Song not found' };
            } catch {
                return { _id: songId, error: 'Catalog service unavailable' };
            }
        })
    );
    return { ...playlist.toObject(), songs: enrichedSongs };
};

// Add a song from the catalog to a playlist (owner only)
const addSongToPlaylist = async (playlistId, songId, userId) => {
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new Error('Playlist not found');
    }
    if (playlist.owner !== userId) {
        throw new Error('Unauthorized');
    }
    await verifySongExists(songId);
    if (playlist.songs.includes(songId)) {
        throw new Error('Song already in playlist');
    }
    playlist.songs.push(songId);
    return await playlist.save();
};

// Remove a song from a playlist (owner only)
const removeSongFromPlaylist = async (playlistId, songId, userId) => {
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new Error('Playlist not found');
    }
    if (playlist.owner !== userId) {
        throw new Error('Unauthorized');
    }
    playlist.songs = playlist.songs.filter(s => s !== songId);
    return await playlist.save();
};

module.exports = { createPlaylist, getAllPlaylists, getPlaylistById, enrichPlaylistWithSongs, addSongToPlaylist, removeSongFromPlaylist };
