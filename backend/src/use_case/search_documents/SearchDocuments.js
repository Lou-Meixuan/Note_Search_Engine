/**
 * SearchDocuments Use Case - Hybrid Search (BM25 + Embedding)
 * 
 * Created by: C
 * Date: 2026-01-06
 * 
 * 【Hybrid Search 原理】
 * 最终分数 = α × BM25_score + (1-α) × Embedding_similarity
 * 
 * - BM25: 精确词匹配（用户搜 "React"，文档必须有 "React"）
 * - Embedding: 语义匹配（用户搜 "前端框架"，能匹配到 React/Vue 文档）
 * 
 * 【依赖】
 * - L 的 Tokenizer: tokenize(), tokenizeFinal()
 * - EmbeddingService: getEmbedding(), cosineSimilarity()
 * - DocumentRepository: findAll(), findBySource()
 */

"use strict";

// L 的 Tokenizer
const { tokenize } = require("../../data_access/tokenizer/Model");
const { tokenizeFinal } = require("../../data_access/tokenizer/Tokens");

// Embedding Service
const EmbeddingService = require("../../data_access/EmbeddingService");

class SearchDocuments {
    /**
     * @param {Object} dependencies - 依赖注入
     * @param {Object} dependencies.documentRepository - 文档仓库
     * @param {number} [dependencies.alpha=0.5] - BM25 权重 (0-1)，Embedding 权重 = 1-alpha
     * @param {boolean} [dependencies.useEmbedding=true] - 是否启用 Embedding
     */
    constructor({ documentRepository, alpha = 0.5, useEmbedding = true } = {}) {
        this.documentRepository = documentRepository;
        this.alpha = alpha;  // BM25 权重
        this.useEmbedding = useEmbedding;

        // BM25 参数
        this.k1 = 1.2;  // 词频饱和参数
        this.b = 0.75;  // 文档长度归一化参数
    }

    /**
     * Execute hybrid search
     * 
     * @param {Object} input
     * @param {string} input.q - 查询字符串
     * @param {string} input.scope - 搜索范围: "local" | "remote" | "all"
     * @returns {Object} 搜索结果
     */
    async execute({ q, scope = "all" }) {
        const startTime = Date.now();

        // 1. Validate input
        if (!q || q.trim().length === 0) {
            return this._emptyResult(q, scope);
        }

        // 2. Get documents
        let documents;
        try {
            if (scope === "all") {
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

        // 3. Tokenize query (使用 L 的 tokenizer，query 模式)
        const queryStats = tokenizeFinal(q, {
            output: "stats",
            mode: "query",  // query 模式：single + bigram 融合，提高召回
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

        // 4. Build document index and calculate BM25
        const { docIndex, avgDocLength } = this._buildDocumentIndex(documents);
        const bm25Scores = this._calculateBM25(queryStats.tf, docIndex, documents.length, avgDocLength);

        // 5. Calculate Embedding similarity (if enabled)
        let embeddingScores = {};
        if (this.useEmbedding) {
            try {
                embeddingScores = await this._calculateEmbeddingScores(q, documents);
            } catch (error) {
                console.warn("[SearchDocuments] Embedding failed, using BM25 only:", error.message);
                // Embedding 失败时，只用 BM25
            }
        }

        // 6. Combine scores (Hybrid fusion)
        const combinedResults = this._fuseScores(documents, bm25Scores, embeddingScores);

        // 7. Sort by score
        combinedResults.sort((a, b) => b.score - a.score);

        // 8. Filter zero-score results and generate snippets
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
     * 
     * @param {Document[]} documents
     * @returns {{ docIndex: Map, avgDocLength: number }}
     */
    _buildDocumentIndex(documents) {
        const docIndex = new Map();
        let totalLength = 0;

        for (const doc of documents) {
            const content = doc.content || "";
            const title = doc.title || "";

            // Tokenize document (document 模式)
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
     * 【BM25 公式】
     * score(D, Q) = Σ IDF(qi) × (tf × (k1 + 1)) / (tf + k1 × (1 - b + b × |D|/avgdl))
     * 
     * IDF(qi) = log((N - n(qi) + 0.5) / (n(qi) + 0.5) + 1)
     * 
     * @param {Object} queryTF - 查询词的 TF
     * @param {Map} docIndex - 文档索引
     * @param {number} totalDocs - 总文档数
     * @param {number} avgDocLength - 平均文档长度
     * @returns {Object} docId -> BM25 score
     */
    _calculateBM25(queryTF, docIndex, totalDocs, avgDocLength) {
        const scores = {};
        const queryTerms = Object.keys(queryTF);

        // 计算每个查询词的 IDF
        const idf = {};
        for (const term of queryTerms) {
            // 统计包含该词的文档数
            let docFreq = 0;
            for (const [docId, data] of docIndex) {
                if (data.tf[term]) {
                    docFreq++;
                }
            }
            // IDF = log((N - df + 0.5) / (df + 0.5) + 1)
            idf[term] = Math.log((totalDocs - docFreq + 0.5) / (docFreq + 0.5) + 1);
        }

        // 计算每个文档的 BM25 分数
        for (const [docId, data] of docIndex) {
            let score = 0;
            const docLength = data.length;

            for (const term of queryTerms) {
                const tf = data.tf[term] || 0;
                if (tf === 0) continue;

                const termIDF = idf[term];

                // BM25 公式
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
     * 
     * @param {string} query - 原始查询
     * @param {Document[]} documents - 文档列表
     * @returns {Object} docId -> embedding similarity
     */
    async _calculateEmbeddingScores(query, documents) {
        const scores = {};

        // 生成查询的 embedding
        const queryEmbedding = await EmbeddingService.getEmbedding(query);
        if (!queryEmbedding) {
            return scores;
        }

        // 计算每个文档的相似度
        for (const doc of documents) {
            // 使用标题 + 内容前 500 字符生成 embedding
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
     * 【融合公式】
     * final_score = α × normalize(BM25) + (1-α) × Embedding
     * 
     * @param {Document[]} documents
     * @param {Object} bm25Scores
     * @param {Object} embeddingScores
     * @returns {Object[]} Combined results
     */
    _fuseScores(documents, bm25Scores, embeddingScores) {
        const results = [];

        // Normalize BM25 scores to 0-1
        const bm25Values = Object.values(bm25Scores);
        const maxBM25 = Math.max(...bm25Values, 0.001);  // 避免除零

        const hasEmbedding = Object.keys(embeddingScores).length > 0;

        for (const doc of documents) {
            const bm25Raw = bm25Scores[doc.id] || 0;
            const bm25Normalized = bm25Raw / maxBM25;
            const embeddingScore = embeddingScores[doc.id] || 0;

            // Hybrid fusion
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
