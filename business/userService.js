const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../data/userModel');

// Register a new user with hashed password
const register = async (email, username, password) => {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
        throw new Error('Email already in use');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, username, password: hashedPassword });
    return await user.save();
};

// Authenticate user and return a JWT token
const login = async (email, password) => {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
        throw new Error('Invalid credentials');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Invalid credentials');
    }
    const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
    return { token, user: { id: user._id, email: user.email, username: user.username } };
};

// Retrieve user profile by ID without the password field
const getProfile = async (userId) => {
    const user = await User.findById(userId).select('-password');
    if (!user) {
        throw new Error('User not found');
    }
    return user;
};

module.exports = { register, login, getProfile };
