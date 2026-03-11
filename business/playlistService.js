const Playlist = require('../data/playlistModel');
const Song = require('../data/catalogModel');

// Create a new playlist for a user
const createPlaylist = async (name, ownerId) => {
    const playlist = new Playlist({ name, owner: ownerId });
    return await playlist.save();
};

// Retrieve all playlists with owner and songs details
const getAllPlaylists = async () => {
    return await Playlist.find()
        .populate('owner', 'username email')
        .populate('songs');
};

// Retrieve a playlist by its ID with populated details
const getPlaylistById = async (id) => {
    const playlist = await Playlist.findById(id)
        .populate('owner', 'username email')
        .populate('songs');
    if (!playlist) {
        throw new Error('Playlist not found');
    }
    return playlist;
};

// Add a song from the catalog to a playlist (owner only)
const addSongToPlaylist = async (playlistId, songId, userId) => {
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new Error('Playlist not found');
    }
    if (playlist.owner.toString() !== userId) {
        throw new Error('Unauthorized');
    }
    const song = await Song.findById(songId);
    if (!song) {
        throw new Error('Song not found in catalog');
    }
    if (playlist.songs.some(s => s.toString() === songId)) {
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
    if (playlist.owner.toString() !== userId) {
        throw new Error('Unauthorized');
    }
    playlist.songs = playlist.songs.filter(s => s.toString() !== songId);
    return await playlist.save();
};

module.exports = { createPlaylist, getAllPlaylists, getPlaylistById, addSongToPlaylist, removeSongFromPlaylist };
