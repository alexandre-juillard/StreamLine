const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    owner: { type: String, required: true },
    songs: [{ type: String }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Playlist', playlistSchema);
