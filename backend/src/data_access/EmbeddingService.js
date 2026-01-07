/**
 * EmbeddingService - 使用 Transformers.js 生成文本向量
 * 
 * 【功能】
 * 将文本转换为向量（embedding），用于语义搜索
 * 
 * 【模型选择】
 * - all-MiniLM-L6-v2: 英文，384维，90MB，速度快
 * - paraphrase-multilingual-MiniLM-L12-v2: 多语言（含中文），384维，470MB
 * - multilingual-e5-small: 多语言，384维，效果好
 * 
 * 我们选择 multilingual-e5-small，因为：
 * 1. 支持中英文
 * 2. 效果好
 * 3. 大小适中
 * 
 * 【注意】
 * 第一次运行会下载模型（约 100-500MB），需要等待
 */

"use strict";

// Transformers.js 使用动态 import（ESM 模块）
let pipeline = null;
let extractor = null;
let isLoading = false;
let loadPromise = null;

// 模型配置
const MODEL_NAME = "Xenova/multilingual-e5-small";
// 备选模型（如果上面的下载太慢）
// const MODEL_NAME = "Xenova/all-MiniLM-L6-v2";  // 英文，更小更快

/**
 * 初始化 embedding pipeline
 * 使用懒加载：第一次调用时才加载模型
 */
async function initPipeline() {
    if (extractor) return extractor;

    if (isLoading) {
        // 如果正在加载，等待加载完成
        return loadPromise;
    }

    isLoading = true;

    loadPromise = (async () => {
        try {
            console.log(`[EmbeddingService] Loading model: ${MODEL_NAME}...`);
            console.log("[EmbeddingService] First run will download the model (100-500MB), please wait...");

            // 动态导入 Transformers.js
            const { pipeline: pipelineFn } = await import("@xenova/transformers");
            pipeline = pipelineFn;

            // 创建 feature-extraction pipeline
            extractor = await pipeline("feature-extraction", MODEL_NAME, {
                quantized: true,  // 使用量化模型，更小更快
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
 * 生成单个文本的 embedding 向量
 * 
 * @param {string} text - 输入文本
 * @returns {Promise<number[]>} - 向量数组（384维）
 * 
 * 【使用示例】
 * const vector = await getEmbedding("machine learning is great");
 * // vector: [0.012, -0.034, 0.056, ..., 0.089] (384个数字)
 */
async function getEmbedding(text) {
    if (!text || typeof text !== "string" || text.trim().length === 0) {
        return null;
    }

    const ext = await initPipeline();

    // 对于 e5 模型，需要添加前缀
    // 查询用 "query: "，文档用 "passage: "
    const prefixedText = text;  // 可以根据需要添加前缀

    const output = await ext(prefixedText, {
        pooling: "mean",      // 使用 mean pooling
        normalize: true,      // 归一化向量（用于余弦相似度）
    });

    // 转换为普通数组
    return Array.from(output.data);
}

/**
 * 批量生成 embeddings
 * 
 * @param {string[]} texts - 文本数组
 * @returns {Promise<number[][]>} - 向量数组的数组
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
 * 计算两个向量的余弦相似度
 * 
 * @param {number[]} vecA - 向量 A
 * @param {number[]} vecB - 向量 B
 * @returns {number} - 相似度 (0-1)
 * 
 * 【公式】
 * cosine_similarity = (A · B) / (||A|| × ||B||)
 * 
 * 由于我们的向量已经归一化（normalize: true），
 * 所以 ||A|| = ||B|| = 1，直接计算点积即可
 */
function cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length) {
        return 0;
    }

    let dotProduct = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
    }

    // 由于向量已归一化，点积就是余弦相似度
    return dotProduct;
}

/**
 * 预热模型（可选）
 * 在服务器启动时调用，提前加载模型
 */
async function warmup() {
    console.log("[EmbeddingService] Warming up...");
    await getEmbedding("warmup");
    console.log("[EmbeddingService] Warmup complete!");
}

/**
 * 检查服务是否就绪
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

