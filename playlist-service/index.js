require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const connectDatabase = require('./data/database');
const playlistRoutes = require('./presentation/playlistRoutes');

const app = express();
const PORT = process.env.PORT || 8083;

app.use(helmet());
app.use(cors());
app.use(express.json());

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'StreamLine - Playlist Service',
            version: '1.0.0',
            description: 'Playlist microservice: playlist management'
        },
        servers: [{ url: `http://localhost:${PORT}` }],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        }
    },
    apis: ['./presentation/*.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/playlists', playlistRoutes);

// Start server and connect to database
const startServer = async () => {
    try {
        await connectDatabase();
        app.listen(PORT, () => {
            console.log(`Playlist Service running on http://localhost:${PORT}`);
            console.log(`Swagger docs: http://localhost:${PORT}/api-docs`);
        });
    } catch (err) {
        console.error('Failed to start Playlist Service:', err.message);
        process.exit(1);
    }
};

startServer();
