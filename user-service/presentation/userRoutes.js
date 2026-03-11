const express = require('express');
const router = express.Router();
const userService = require('../business/userService');
const authenticate = require('./authMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         email:
 *           type: string
 *         username:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - email
 *         - username
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         username:
 *           type: string
 *         password:
 *           type: string
 *           minLength: 6
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *     LoginResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             email:
 *               type: string
 *             username:
 *               type: string
 */

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error or email already in use
 */
router.post('/register', async (req, res) => {
    // Register a new user and notify notification-service
    try {
        const { email, username, password } = req.body;
        if (!email || !username || !password) {
            return res.status(400).json({ error: 'Email, username and password are required.' });
        }
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters.' });
        }
        const user = await userService.register(email, username, password);
        try {
            await fetch(`${process.env.NOTIFICATION_SERVICE_URL}/notifications/welcome`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, username })
            });
        } catch (notifErr) {
            console.error('Failed to call notification service:', notifErr.message);
        }
        res.status(201).json({ message: 'User registered successfully', userId: user._id });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Authenticate user and get JWT token
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Invalid credentials
 */
router.post('/login', async (req, res) => {
    // Authenticate user and return JWT token
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }
        const result = await userService.login(email, password);
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Get the profile of the authenticated user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', authenticate, async (req, res) => {
    // Return the authenticated user's profile
    try {
        const user = await userService.getProfile(req.user.id);
        res.json(user);
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
});

module.exports = router;
