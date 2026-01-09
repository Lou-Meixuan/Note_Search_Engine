/**
 * SearchDocuments.js - Hybrid search use case (BM25 + Embedding)
 * 
 * Combines BM25 keyword matching with semantic embedding similarity.
 */

"use strict";

const { tokenize } = require("../../data_access/tokenizer/Model");
const { tokenizeFinal } = require("../../data_access/tokenizer/Tokens");
const EmbeddingService = require("../../data_access/EmbeddingService");

class SearchDocuments {
    /**
     * @param {Object} dependencies
     * @param {Object} dependencies.documentRepository
     * @param {number} [dependencies.alpha=0.5] - BM25 weight (0-1), Embedding weight = 1-alpha
     * @param {boolean} [dependencies.useEmbedding] - Enable embedding search (default: from env or false)
     */
    constructor({ documentRepository, alpha = 0.5, useEmbedding } = {}) {
        this.documentRepository = documentRepository;
        this.alpha = alpha;
        // Enable embedding if USE_EMBEDDING env is set, otherwise check parameter
        // On Render free tier, set USE_EMBEDDING=true and ensure warmup runs at startup
        this.useEmbedding = useEmbedding ?? (process.env.USE_EMBEDDING === 'true');

        // BM25 parameters
        this.k1 = 1.2;
        this.b = 0.75;
    }

    /**
     * Execute hybrid search
     * @param {Object} input
     * @param {string} input.q - Query string
     * @param {string} input.scope - Search scope: "local" | "remote" | "all"
     * @param {string} input.userId - User ID to filter documents (optional)
     * @returns {Object} Search results
     */
    async execute({ q, scope = "all", userId = null }) {
        const startTime = Date.now();

        if (!q || q.trim().length === 0) {
            return this._emptyResult(q, scope);
        }

        let documents;
        try {
            // If userId is provided, only search that user's documents
            if (userId) {
                documents = await this.documentRepository.findByUserId(userId);
            } else if (scope === "all") {
                documents = await this.documentRepository.findAll();
            } else {
                documents = await this.documentRepository.findBySource(scope);
            }
        } catch (error) {
            console.error("[SearchDocuments] Failed to fetch documents:", error);
            return this._emptyResult(q, scope, error.message);
        }

        if (!documents || documents.length === 0) {
            return this._emptyResult(q, scope);
        }

        console.log(`[SearchDocuments] Searching "${q}" in ${documents.length} documents (scope: ${scope})`);

        // Tokenize query (query mode for better recall)
        const queryStats = tokenizeFinal(q, {
            output: "stats",
            mode: "query",
            postOptions: {
                maxTokens: 1000,
                maxTokenLength: 64,
                dropNoiseTokens: true,
            },
        });

        console.log(`[SearchDocuments] Query tokens:`, queryStats.tokens);

        if (queryStats.tokens.length === 0) {
            return this._emptyResult(q, scope);
        }

        // Build document index and calculate BM25
        const { docIndex, avgDocLength } = this._buildDocumentIndex(documents);
        const bm25Scores = this._calculateBM25(queryStats.tf, docIndex, documents.length, avgDocLength);

        // Calculate Embedding similarity (if enabled)
        let embeddingScores = {};
        if (this.useEmbedding) {
            try {
                embeddingScores = await this._calculateEmbeddingScores(q, documents);
            } catch (error) {
                console.warn("[SearchDocuments] Embedding failed, using BM25 only:", error.message);
            }
        }

        // Combine scores (Hybrid fusion)
        const combinedResults = this._fuseScores(documents, bm25Scores, embeddingScores);

        // Sort by score
        combinedResults.sort((a, b) => b.score - a.score);

        // Filter and generate snippets
        const finalResults = combinedResults
            .filter(r => r.score > 0)
            .map(r => ({
                docId: r.docId,
                title: r.title,
                source: r.source,
                score: Math.round(r.score * 10000) / 10000,
                bm25Score: Math.round((r.bm25Score || 0) * 10000) / 10000,
                embeddingScore: Math.round((r.embeddingScore || 0) * 10000) / 10000,
                snippet: this._generateSnippet(r.content, queryStats.tokens),
                fileType: r.fileType,
                createdAt: r.createdAt,
            }));

        const elapsed = Date.now() - startTime;
        console.log(`[SearchDocuments] Found ${finalResults.length} results in ${elapsed}ms`);

        return {
            query: q,
            scope,
            totalResults: finalResults.length,
            elapsed: `${elapsed}ms`,
            results: finalResults,
        };
    }

    /**
     * Build document index for BM25
     */
    _buildDocumentIndex(documents) {
        const docIndex = new Map();
        let totalLength = 0;

        for (const doc of documents) {
            const content = doc.content || "";
            const title = doc.title || "";

            const stats = tokenizeFinal(`${title} ${title} ${content}`, {
                output: "stats",
                mode: "document",
                postOptions: {
                    maxTokens: 10000,
                    maxTokenLength: 64,
                    dropNoiseTokens: true,
                },
            });

            docIndex.set(doc.id, {
                tf: stats.tf,
                length: stats.length,
                doc: doc,
            });

            totalLength += stats.length;
        }

        const avgDocLength = documents.length > 0 ? totalLength / documents.length : 0;

        return { docIndex, avgDocLength };
    }

    /**
     * Calculate BM25 scores
     * 
     * BM25 formula:
     * score(D, Q) = Σ IDF(qi) × (tf × (k1 + 1)) / (tf + k1 × (1 - b + b × |D|/avgdl))
     */
    _calculateBM25(queryTF, docIndex, totalDocs, avgDocLength) {
        const scores = {};
        const queryTerms = Object.keys(queryTF);

        // Calculate IDF for each query term
        const idf = {};
        for (const term of queryTerms) {
            let docFreq = 0;
            for (const [docId, data] of docIndex) {
                if (data.tf[term]) {
                    docFreq++;
                }
            }
            idf[term] = Math.log((totalDocs - docFreq + 0.5) / (docFreq + 0.5) + 1);
        }

        // Calculate BM25 score for each document
        for (const [docId, data] of docIndex) {
            let score = 0;
            const docLength = data.length;

            for (const term of queryTerms) {
                const tf = data.tf[term] || 0;
                if (tf === 0) continue;

                const termIDF = idf[term];
                const numerator = tf * (this.k1 + 1);
                const denominator = tf + this.k1 * (1 - this.b + this.b * (docLength / avgDocLength));

                score += termIDF * (numerator / denominator);
            }

            scores[docId] = score;
        }

        return scores;
    }

    /**
     * Calculate Embedding similarity scores
     */
    async _calculateEmbeddingScores(query, documents) {
        const scores = {};

        const queryEmbedding = await EmbeddingService.getEmbedding(query);
        if (!queryEmbedding) {
            return scores;
        }

        for (const doc of documents) {
            const text = `${doc.title || ""} ${(doc.content || "").substring(0, 500)}`;
            const docEmbedding = await EmbeddingService.getEmbedding(text);

            if (docEmbedding) {
                scores[doc.id] = EmbeddingService.cosineSimilarity(queryEmbedding, docEmbedding);
            }
        }

        return scores;
    }

    /**
     * Fuse BM25 and Embedding scores
     * 
     * Fusion formula: final_score = α × normalize(BM25) + (1-α) × Embedding
     */
    _fuseScores(documents, bm25Scores, embeddingScores) {
        const results = [];

        // Normalize BM25 scores to 0-1
        const bm25Values = Object.values(bm25Scores);
        const maxBM25 = Math.max(...bm25Values, 0.001);

        const hasEmbedding = Object.keys(embeddingScores).length > 0;

        for (const doc of documents) {
            const bm25Raw = bm25Scores[doc.id] || 0;
            const bm25Normalized = bm25Raw / maxBM25;
            const embeddingScore = embeddingScores[doc.id] || 0;

            let finalScore;
            if (hasEmbedding) {
                finalScore = this.alpha * bm25Normalized + (1 - this.alpha) * embeddingScore;
            } else {
                finalScore = bm25Normalized;
            }

            results.push({
                docId: doc.id,
                title: doc.title,
                source: doc.source,
                content: doc.content,
                fileType: doc.fileType,
                createdAt: doc.createdAt,
                score: finalScore,
                bm25Score: bm25Normalized,
                embeddingScore: embeddingScore,
            });
        }

        return results;
    }

    /**
     * Generate snippet with matching terms
     */
    _generateSnippet(content, queryTokens, snippetLength = 150) {
        if (!content) return "";

        const lowerContent = content.toLowerCase();
        let bestPosition = -1;

        for (const token of queryTokens) {
            const pos = lowerContent.indexOf(token.toLowerCase());
            if (pos !== -1 && (bestPosition === -1 || pos < bestPosition)) {
                bestPosition = pos;
            }
        }

        if (bestPosition === -1) {
            return content.substring(0, snippetLength) + (content.length > snippetLength ? "..." : "");
        }

        const start = Math.max(0, bestPosition - 50);
        const end = Math.min(content.length, start + snippetLength);
        let snippet = content.substring(start, end);

        if (start > 0) snippet = "..." + snippet;
        if (end < content.length) snippet = snippet + "...";

        return snippet;
    }

    /**
     * Return empty result
     */
    _emptyResult(query, scope, error = null) {
        return {
            query,
            scope,
            totalResults: 0,
            results: [],
            ...(error && { error }),
        };
    }
}

module.exports = { SearchDocuments };
