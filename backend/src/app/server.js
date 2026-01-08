/**
 * server.js - Express server entry point
 */

require('dotenv').config();

const express = require("express");
const cors = require("cors");
const { registerRoutes } = require("./routes");
const { connectToMongoDB, DocumentModel } = require("../data_access/mongodb");
const EmbeddingService = require("../data_access/EmbeddingService");

const app = express();
app.use(cors());
app.use(express.json());

registerRoutes(app);

const PORT = process.env.PORT || 3001;

// Cleanup anonymous documents older than 24 hours
// Runs every hour as a fallback for frontend cleanup
async function cleanupOldAnonymousDocuments() {
    try {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        
        // Find and delete documents with no userId that are older than 24 hours
        const result = await DocumentModel.deleteMany({
            userId: null,
            createdAt: { $lt: twentyFourHoursAgo }
        });

        if (result.deletedCount > 0) {
            console.log(`[Cleanup] Deleted ${result.deletedCount} old anonymous documents`);
        }
    } catch (error) {
        console.error('[Cleanup] Error cleaning up anonymous documents:', error);
    }
}

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

        // Start cleanup job (runs every hour)
        console.log('[Server] Starting anonymous document cleanup job (every 1 hour)');
        cleanupOldAnonymousDocuments(); // Run once at startup
        setInterval(cleanupOldAnonymousDocuments, 60 * 60 * 1000); // Then every hour

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
