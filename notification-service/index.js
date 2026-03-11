require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const notificationRoutes = require('./presentation/notificationRoutes');

const app = express();
const PORT = process.env.PORT || 8084;

app.use(helmet());
app.use(cors());
app.use(express.json());

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'StreamLine - Notification Service',
            version: '1.0.0',
            description: 'Notification microservice: email and notifications'
        },
        servers: [{ url: `http://localhost:${PORT}` }],
    },
    apis: ['./presentation/*.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/notifications', notificationRoutes);

// Start server (no database needed for notification service)
const startServer = () => {
    app.listen(PORT, () => {
        console.log(`Notification Service running on http://localhost:${PORT}`);
        console.log(`Swagger docs: http://localhost:${PORT}/api-docs`);
    });
};

startServer();
