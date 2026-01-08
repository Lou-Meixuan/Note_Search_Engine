/**
 * server.js - Express server entry point
 */

require('dotenv').config();

const express = require("express");
const cors = require("cors");
const { registerRoutes } = require("./routes");
const { connectToMongoDB } = require("../data_access/mongodb");
const EmbeddingService = require("../data_access/EmbeddingService");

const app = express();
app.use(cors());
app.use(express.json());

registerRoutes(app);

const PORT = process.env.PORT || 3001;

// Start server and connect to MongoDB
async function startServer() {
    try {
        // Connect to MongoDB first
        await connectToMongoDB();

        // Pre-warm embedding model if enabled (loads model into memory)
        // This prevents slow first search due to model download
        if (process.env.USE_EMBEDDING === 'true') {
            console.log('[Server] Warming up embedding model...');
            await EmbeddingService.warmup();
            console.log('[Server] Embedding model ready!');
        }

        // Then start the Express server
        app.listen(PORT, () => {
            console.log(`Backend running: http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
