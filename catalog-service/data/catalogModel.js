const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    artist: { type: String, required: true, trim: true },
    album: { type: String, trim: true },
    genre: { type: String, trim: true },
    duration: { type: Number },
    coverUrl: { type: String },
    audioUrl: { type: String },
    createdAt: { type: Date, default: Date.now }
});

songSchema.index({ title: 'text', artist: 'text' });

module.exports = mongoose.model('Song', songSchema);
