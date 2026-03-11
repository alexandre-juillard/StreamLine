const Song = require('../data/catalogModel');

// Escape regex special characters to prevent ReDoS attacks
const escapeRegex = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// Add a new song to the catalog
const addSong = async (songData) => {
    const song = new Song(songData);
    return await song.save();
};

// Retrieve a song by its ID
const getSongById = async (id) => {
    const song = await Song.findById(id);
    if (!song) {
        throw new Error('Song not found');
    }
    return song;
};

// Search songs by title or artist
const searchSongs = async (query) => {
    const escapedQuery = escapeRegex(query);
    return await Song.find({
        $or: [
            { title: { $regex: escapedQuery, $options: 'i' } },
            { artist: { $regex: escapedQuery, $options: 'i' } }
        ]
    });
};

// Retrieve all songs from the catalog
const getAllSongs = async () => {
    return await Song.find();
};

module.exports = { addSong, getSongById, searchSongs, getAllSongs };
