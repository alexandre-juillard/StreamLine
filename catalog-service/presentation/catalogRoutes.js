const express = require('express');
const router = express.Router();
const catalogService = require('../business/catalogService');
const { publish } = require('../business/rabbitmq');
const authenticate = require('./authMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Song:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *         artist:
 *           type: string
 *         album:
 *           type: string
 *         genre:
 *           type: string
 *         duration:
 *           type: number
 *         coverUrl:
 *           type: string
 *         audioUrl:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *     AddSongRequest:
 *       type: object
 *       required:
 *         - title
 *         - artist
 *       properties:
 *         title:
 *           type: string
 *         artist:
 *           type: string
 *         album:
 *           type: string
 *         genre:
 *           type: string
 *         duration:
 *           type: number
 *         coverUrl:
 *           type: string
 *         audioUrl:
 *           type: string
 */

/**
 * @swagger
 * /catalog:
 *   post:
 *     summary: Add a new song to the catalog
 *     tags: [Catalog]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddSongRequest'
 *     responses:
 *       201:
 *         description: Song added successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticate, async (req, res) => {
    // Add a new song to the catalog
    try {
        const { title, artist } = req.body;
        if (!title || !artist) {
            return res.status(400).json({ error: 'Title and artist are required.' });
        }
        const song = await catalogService.addSong(req.body);
        publish('track.added', { email: req.user.email, title: song.title, artist: song.artist });
        res.status(201).json(song);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

/**
 * @swagger
 * /catalog/search:
 *   get:
 *     summary: Search songs by title or artist
 *     tags: [Catalog]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query for title or artist
 *     responses:
 *       200:
 *         description: List of matching songs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Song'
 *       400:
 *         description: Missing query parameter
 */
router.get('/search', async (req, res) => {
    // Search songs by title or artist
    try {
        const { q } = req.query;
        if (!q || !q.trim()) {
            return res.status(400).json({ error: 'Query parameter "q" is required.' });
        }
        const songs = await catalogService.searchSongs(q.trim());
        res.json(songs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /catalog/{id}:
 *   get:
 *     summary: Get a song by ID
 *     tags: [Catalog]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Song ID
 *     responses:
 *       200:
 *         description: Song details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Song'
 *       404:
 *         description: Song not found
 */
router.get('/:id', async (req, res) => {
    // Get a single song by its ID
    try {
        const song = await catalogService.getSongById(req.params.id);
        res.json(song);
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({ error: 'Invalid ID format.' });
        }
        const status = err.message === 'Song not found' ? 404 : 500;
        res.status(status).json({ error: err.message });
    }
});

/**
 * @swagger
 * /catalog:
 *   get:
 *     summary: Get all songs from the catalog
 *     tags: [Catalog]
 *     responses:
 *       200:
 *         description: List of all songs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Song'
 */
router.get('/', async (req, res) => {
    // Retrieve all songs from the catalog
    try {
        const songs = await catalogService.getAllSongs();
        res.json(songs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
