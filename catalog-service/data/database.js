const mongoose = require('mongoose');

// Initialize MongoDB connection for catalog-service
const connectDatabase = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Catalog Service connected to MongoDB');
};

module.exports = connectDatabase;
