/**
 * EmbeddingService.js - Text embedding generation
 * 
 * Uses Transformers.js with multilingual-e5-small model for semantic search.
 * First run downloads the model (~100-500MB).
 */

"use strict";

let pipeline = null;
let extractor = null;
let isLoading = false;
let loadPromise = null;

const MODEL_NAME = "Xenova/multilingual-e5-small";

/**
 * Initialize embedding pipeline (lazy loading)
 */
async function initPipeline() {
    if (extractor) return extractor;

    if (isLoading) {
        return loadPromise;
    }

    isLoading = true;

    loadPromise = (async () => {
        try {
            console.log(`[EmbeddingService] Loading model: ${MODEL_NAME}...`);
            console.log("[EmbeddingService] First run will download the model, please wait...");

            const { pipeline: pipelineFn } = await import("@xenova/transformers");
            pipeline = pipelineFn;

            extractor = await pipeline("feature-extraction", MODEL_NAME, {
                quantized: true,
            });

            console.log("[EmbeddingService] Model loaded successfully!");
            return extractor;
        } catch (error) {
            console.error("[EmbeddingService] Failed to load model:", error);
            isLoading = false;
            throw error;
        }
    })();

    return loadPromise;
}

/**
 * Generate embedding vector for a single text
 * @param {string} text - Input text
 * @returns {Promise<number[]>} - Vector array (384 dimensions)
 */
async function getEmbedding(text) {
    if (!text || typeof text !== "string" || text.trim().length === 0) {
        return null;
    }

    const ext = await initPipeline();

    const output = await ext(text, {
        pooling: "mean",
        normalize: true,
    });

    return Array.from(output.data);
}

/**
 * Generate embeddings for multiple texts
 * @param {string[]} texts - Array of texts
 * @returns {Promise<number[][]>} - Array of vectors
 */
async function getEmbeddings(texts) {
    if (!texts || texts.length === 0) {
        return [];
    }

    const ext = await initPipeline();
    const results = [];

    for (const text of texts) {
        if (!text || text.trim().length === 0) {
            results.push(null);
            continue;
        }

        const output = await ext(text, {
            pooling: "mean",
            normalize: true,
        });

        results.push(Array.from(output.data));
    }

    return results;
}

/**
 * Compute cosine similarity between two vectors
 * @param {number[]} vecA - Vector A
 * @param {number[]} vecB - Vector B
 * @returns {number} - Similarity score (0-1)
 */
function cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length) {
        return 0;
    }

    let dotProduct = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
    }

    return dotProduct;
}

/**
 * Warmup model (optional, call at server startup)
 */
async function warmup() {
    console.log("[EmbeddingService] Warming up...");
    await getEmbedding("warmup");
    console.log("[EmbeddingService] Warmup complete!");
}

/**
 * Check if service is ready
 */
function isReady() {
    return extractor !== null;
}

module.exports = {
    getEmbedding,
    getEmbeddings,
    cosineSimilarity,
    warmup,
    isReady,
};
