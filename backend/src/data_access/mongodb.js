/**
 * mongodb.js - Database connection and schemas
 */

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/note_search_engine';

let isConnected = false;

async function connectToMongoDB() {
    if (isConnected) {
        console.log('Already connected to MongoDB');
        return;
    }

    try {
        await mongoose.connect(MONGODB_URI);
        isConnected = true;
        console.log('Connected to MongoDB:', MONGODB_URI);
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
}

// Document Schema
const documentSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    fileType: {
        type: String,
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    source: {
        type: String,
        required: true,
        enum: ['local', 'remote'],
        default: 'local'
    },
    tags: {
        type: [String],
        default: []
    },
    userId: {
        type: String,
        required: false,
        index: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    fileBuffer: {
        type: Buffer,
        required: false
    },
    mimeType: {
        type: String,
        required: false
    }
});

// Create indexes for better search performance
documentSchema.index({ title: 'text', content: 'text' });
documentSchema.index({ source: 1 });
documentSchema.index({ createdAt: -1 });

const DocumentModel = mongoose.model('Document', documentSchema);

// Index Schema - stores inverted index and document stats
const indexSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['inverted', 'docstats'],
        unique: true
    },
    data: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

indexSchema.index({ type: 1 });

const IndexModel = mongoose.model('Index', indexSchema);

module.exports = {
    connectToMongoDB,
    DocumentModel,
    IndexModel
};
