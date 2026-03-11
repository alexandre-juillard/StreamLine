const amqp = require('amqplib');
const { sendWelcomeEmail, sendConfirmationEmail } = require('./notificationService');

// Connect to RabbitMQ and consume events from all producers
const startConsumer = async () => {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertExchange('streamline_events', 'topic', { durable: true });

    const { queue } = await channel.assertQueue('notification_queue', { durable: true });

    await channel.bindQueue(queue, 'streamline_events', 'user.registered');
    await channel.bindQueue(queue, 'streamline_events', 'track.added');
    await channel.bindQueue(queue, 'streamline_events', 'playlist.created');

    console.log('Notification Service consuming events from RabbitMQ');

    channel.consume(queue, async (msg) => {
        if (!msg) return;
        const routingKey = msg.fields.routingKey;
        let data;
        try {
            data = JSON.parse(msg.content.toString());
        } catch {
            console.error('Invalid message format');
            channel.ack(msg);
            return;
        }

        try {
            switch (routingKey) {
                case 'user.registered':
                    // Handle new user registration event
                    await sendWelcomeEmail(data.email, data.username);
                    console.log(`Welcome email sent to ${data.email}`);
                    break;
                case 'track.added':
                    // Handle new track added event
                    await sendConfirmationEmail(data.email, `New track added: "${data.title}" by ${data.artist}`);
                    console.log(`Track confirmation sent to ${data.email}`);
                    break;
                case 'playlist.created':
                    // Handle new playlist created event
                    await sendConfirmationEmail(data.email, `Playlist "${data.name}" created`);
                    console.log(`Playlist confirmation sent to ${data.email}`);
                    break;
                default:
                    console.log(`Unknown event: ${routingKey}`);
            }
        } catch (err) {
            console.error(`Error processing event ${routingKey}:`, err.message);
        }
        channel.ack(msg);
    });
};

module.exports = { startConsumer };
