const express = require('express');
const router = express.Router();
const playlistService = require('../business/playlistService');
const { publish } = require('../business/rabbitmq');
const authenticate = require('./authMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Playlist:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         owner:
 *           type: string
 *         songs:
 *           type: array
 *           items:
 *             type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *     CreatePlaylistRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *     AddSongToPlaylistRequest:
 *       type: object
 *       required:
 *         - songId
 *       properties:
 *         songId:
 *           type: string
 */

/**
 * @swagger
 * /playlists:
 *   post:
 *     summary: Create a new playlist
 *     tags: [Playlists]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePlaylistRequest'
 *     responses:
 *       201:
 *         description: Playlist created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticate, async (req, res) => {
    // Create a new playlist for the authenticated user
    try {
        const { name } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Playlist name is required.' });
        }
        const playlist = await playlistService.createPlaylist(name.trim(), req.user.id);
        publish('playlist.created', { email: req.user.email, name: name.trim() });
        res.status(201).json(playlist);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

/**
 * @swagger
 * /playlists:
 *   get:
 *     summary: Get all playlists
 *     tags: [Playlists]
 *     responses:
 *       200:
 *         description: List of all playlists
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Playlist'
 */
router.get('/', async (req, res) => {
    // Retrieve all playlists
    try {
        const playlists = await playlistService.getAllPlaylists();
        res.json(playlists);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /playlists/{id}:
 *   get:
 *     summary: Get a playlist by ID with enriched song details
 *     tags: [Playlists]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Playlist ID
 *     responses:
 *       200:
 *         description: Playlist details with songs from catalog
 *       404:
 *         description: Playlist not found
 */
router.get('/:id', async (req, res) => {
    // Retrieve a playlist with enriched song details from catalog-service
    try {
        const playlist = await playlistService.getPlaylistById(req.params.id);
        const enriched = await playlistService.enrichPlaylistWithSongs(playlist);
        res.json(enriched);
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({ error: 'Invalid ID format.' });
        }
        const status = err.message === 'Playlist not found' ? 404 : 500;
        res.status(status).json({ error: err.message });
    }
});

/**
 * @swagger
 * /playlists/{id}/songs:
 *   post:
 *     summary: Add a song to a playlist
 *     tags: [Playlists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Playlist ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddSongToPlaylistRequest'
 *     responses:
 *       200:
 *         description: Song added to playlist
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not the playlist owner
 *       404:
 *         description: Playlist or song not found
 */
router.post('/:id/songs', authenticate, async (req, res) => {
    // Add a song from the catalog to a playlist via catalog-service
    try {
        const { songId } = req.body;
        if (!songId) {
            return res.status(400).json({ error: 'songId is required.' });
        }
        const playlist = await playlistService.addSongToPlaylist(req.params.id, songId, req.user.id);
        res.json(playlist);
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({ error: 'Invalid ID format.' });
        }
        const status = err.message === 'Unauthorized' ? 403 :
            err.message.includes('not found') ? 404 : 400;
        res.status(status).json({ error: err.message });
    }
});

/**
 * @swagger
 * /playlists/{id}/songs/{songId}:
 *   delete:
 *     summary: Remove a song from a playlist
 *     tags: [Playlists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Playlist ID
 *       - in: path
 *         name: songId
 *         required: true
 *         schema:
 *           type: string
 *         description: Song ID to remove
 *     responses:
 *       200:
 *         description: Song removed from playlist
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not the playlist owner
 *       404:
 *         description: Playlist not found
 */
router.delete('/:id/songs/:songId', authenticate, async (req, res) => {
    // Remove a song from a playlist
    try {
        const playlist = await playlistService.removeSongFromPlaylist(req.params.id, req.params.songId, req.user.id);
        res.json(playlist);
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({ error: 'Invalid ID format.' });
        }
        const status = err.message === 'Unauthorized' ? 403 :
            err.message.includes('not found') ? 404 : 400;
        res.status(status).json({ error: err.message });
    }
});

module.exports = router;
