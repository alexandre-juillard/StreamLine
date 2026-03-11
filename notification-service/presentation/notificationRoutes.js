const express = require('express');
const router = express.Router();
const { sendWelcomeEmail, sendConfirmationEmail } = require('../business/notificationService');

/**
 * @swagger
 * components:
 *   schemas:
 *     WelcomeRequest:
 *       type: object
 *       required:
 *         - email
 *         - username
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         username:
 *           type: string
 *     ConfirmationRequest:
 *       type: object
 *       required:
 *         - email
 *         - action
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         action:
 *           type: string
 */

/**
 * @swagger
 * /notifications/welcome:
 *   post:
 *     summary: Send a welcome email to a new user
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WelcomeRequest'
 *     responses:
 *       200:
 *         description: Welcome email sent
 *       400:
 *         description: Validation error
 *       500:
 *         description: Email sending failed
 */
router.post('/welcome', async (req, res) => {
    // Send welcome email via notification service
    try {
        const { email, username } = req.body;
        if (!email || !username) {
            return res.status(400).json({ error: 'Email and username are required.' });
        }
        await sendWelcomeEmail(email, username);
        res.json({ message: 'Welcome email sent successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to send welcome email: ' + err.message });
    }
});

/**
 * @swagger
 * /notifications/confirmation:
 *   post:
 *     summary: Send an action confirmation email
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ConfirmationRequest'
 *     responses:
 *       200:
 *         description: Confirmation email sent
 *       400:
 *         description: Validation error
 *       500:
 *         description: Email sending failed
 */
router.post('/confirmation', async (req, res) => {
    // Send confirmation email via notification service
    try {
        const { email, action } = req.body;
        if (!email || !action) {
            return res.status(400).json({ error: 'Email and action are required.' });
        }
        await sendConfirmationEmail(email, action);
        res.json({ message: 'Confirmation email sent successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to send confirmation email: ' + err.message });
    }
});

module.exports = router;
