const mongoose = require('mongoose');

// Initialize MongoDB connection
const connectDatabase = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
};

module.exports = connectDatabase;
