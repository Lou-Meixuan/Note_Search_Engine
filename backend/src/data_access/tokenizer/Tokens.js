/**
 * Tokens.js - Tokenization pipeline
 * 
 * Pipeline: text -> Model.tokenize -> PostProcess -> final tokens
 * Exports: tokenizeFinal, cosineSimilarity
 */

"use strict";

const { tokenize } = require("./Model");
const { postProcessTokens } = require("./PostTokenization");

function makeTF(tokens) {
    const tf = Object.create(null);
    for (const t of tokens) tf[t] = (tf[t] || 0) + 1;
    return tf;
}

/**
 * Compute cosine similarity between two TF maps
 * @param {Object} tf1 - Term frequency map 1
 * @param {Object} tf2 - Term frequency map 2
 * @returns {number} Similarity score [0, 1]
 */
function cosineSimilarity(tf1, tf2) {
    let dot = 0;
    let normA = 0;
    let normB = 0;

    for (const term in tf1) {
        const a = tf1[term];
        normA += a * a;
        if (term in tf2) dot += a * tf2[term];
    }

    for (const term in tf2) {
        const b = tf2[term];
        normB += b * b;
    }

    if (normA === 0 || normB === 0) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Final tokenization entry point (Model -> Post -> Final)
 * 
 * @param {string} text - Input text
 * @param {Object} options
 * @param {"tokens"|"stats"} options.output - Output mode
 * @param {"document"|"query"} options.mode - Tokenization mode
 * @param {Object} options.postOptions - Post-processing options
 * @returns {string[]|Object} Tokens array or stats object
 */
function tokenizeFinal(text, options = {}) {
    const { output = "tokens", postOptions = {} } = options;

    // 1) Model (core + policy)
    const modelTokens = tokenize(text, { ...options, output: "tokens" });

    // 2) Post-processing
    const cleanedTokens = postProcessTokens(modelTokens, {
        removeStopwords: false,
        removeZhStopwords: false,
        ...postOptions,
    });

    // 3) Final output
    if (output === "tokens") return cleanedTokens;

    if (output === "stats") {
        const tf = makeTF(cleanedTokens);
        return {
            tf,
            length: cleanedTokens.length,
            uniqueTerms: Object.keys(tf).length,
            tokens: cleanedTokens,
        };
    }

    return cleanedTokens;
}

module.exports = {
    tokenizeFinal,
    cosineSimilarity
};
