const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Escape HTML special characters to prevent injection in emails
const escapeHtml = (text) => {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(text).replace(/[&<>"']/g, (c) => map[c]);
};

// Send welcome email to a newly registered user
const sendWelcomeEmail = async (email, username) => {
    const safeUsername = escapeHtml(username);
    await transporter.sendMail({
        from: '"StreamLine" <noreply@streamline.com>',
        to: email,
        subject: 'Welcome to StreamLine!',
        html: `<h1>Welcome ${safeUsername}!</h1><p>Your account has been created successfully. Enjoy streaming your favorite music!</p>`
    });
};

// Send confirmation email after a user action
const sendConfirmationEmail = async (email, action) => {
    const safeAction = escapeHtml(action);
    await transporter.sendMail({
        from: '"StreamLine" <noreply@streamline.com>',
        to: email,
        subject: 'StreamLine - Action Confirmed',
        html: `<p>Your action "<strong>${safeAction}</strong>" has been completed successfully.</p>`
    });
};

module.exports = { sendWelcomeEmail, sendConfirmationEmail };
