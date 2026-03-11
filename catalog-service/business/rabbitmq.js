const amqp = require('amqplib');

let channel = null;

// Connect to RabbitMQ and create a channel
const connectRabbitMQ = async () => {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertExchange('streamline_events', 'topic', { durable: true });
    console.log('Catalog Service connected to RabbitMQ');
};

// Publish a message to the exchange with a routing key
const publish = (routingKey, message) => {
    if (!channel) {
        console.error('RabbitMQ channel not available');
        return;
    }
    channel.publish('streamline_events', routingKey, Buffer.from(JSON.stringify(message)), { persistent: true });
    console.log(`Event published: ${routingKey}`);
};

module.exports = { connectRabbitMQ, publish };
