const mongoose = require('mongoose');

// Initialize MongoDB connection for playlist-service
const connectDatabase = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Playlist Service connected to MongoDB');
};

module.exports = connectDatabase;
