const mongoose = require('mongoose');

// Initialize MongoDB connection for user-service
const connectDatabase = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('User Service connected to MongoDB');
};

module.exports = connectDatabase;
