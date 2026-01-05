// backend/src/data_access/tokenizer/Tokens.js
// 中文注释：Token
// 职责：把 Model（core+policy） 和 Post（后处理） 串起来，然后导出最终结果（final answer）
// 流水线：text -> Model.tokenize -> Post.postProcessTokens -> final output (tokens/stats)
//
// 同时导出 helper：cosineSimilarity（余弦相似度 cosine similarity）
// 说明：这是测试/原型用，真正搜索引擎排序建议用 BM25（BM25）

"use strict";

const { tokenize } = require("./Model");
const { postProcessTokens } = require("./PostTokenization");

function makeTF(tokens) {
    const tf = Object.create(null);
    for (const t of tokens) tf[t] = (tf[t] || 0) + 1;
    return tf;
}

/**
 * cosineSimilarity：基于 TF 的余弦相似度（cosine similarity）
 * - 输入：两个 tf map（term -> count）
 * - 输出：[0, 1]（通常）
 *
 * 中文注释：用于测试/原型验证“token 是否能匹配”，不要当最终 ranking（排序）方案。
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
 * tokenizeFinal：最终出口（Model -> Post -> Final）
 *
 * =========================
 * Input（参数说明）
 * =========================
 *
 * @param {string} text
 *   原始输入文本（支持中英混合 / 标点 / 数字）
 *
 * @param {Object} [options]
 *   Tokenizer 选项对象
 *
 * @param {"tokens"|"stats"} [options.output="tokens"]
 *   输出模式：
 *   - "tokens"
 *     返回最终 token 数组（string[]）
 *
 *   - "stats"
 *     返回统计信息，用于索引 / 相似度计算
 *
 * @param {"document"|"query"} [options.mode="document"]
 *   分词模式：
 *   - "document"
 *     用于文档索引，偏重完整召回与稳定 TF
 *
 *   - "query"
 *     用于查询，允许更激进的召回策略（如 CJK single + bigram 融合）
 *
 * @param {number} [options.queryBigramWeight=1]
 *   仅在 query 模式下生效
 *   - 控制 CJK bigram 在 TF 中的权重
 *
 * @param {Object} [options.postOptions]
 *   后处理（Post Process）选项
 *
 * @param {number} [options.postOptions.maxTokens]
 *   最大 token 数量（超出部分直接截断）
 *
 * @param {number} [options.postOptions.maxTokenLength]
 *   单个 token 允许的最大长度（超出将被丢弃）
 *
 * @param {boolean} [options.postOptions.dropNoiseTokens=false]
 *   是否丢弃明显噪声 token
 *   - 例如：超长无意义串、base64-like、重复符号等
 *
 * @param {boolean} [options.postOptions.removeStopwords=false]
 *   是否在 Post 层移除英文停用词
 *   默认关闭，避免与 Model 层策略重复
 *
 * @param {boolean} [options.postOptions.removeZhStopwords=false]
 *   是否在 Post 层移除中文停用词
 *   默认关闭，避免“双删”
 *
 *
 * =========================
 * Output（返回值）
 * =========================
 *
 * @returns {string[] | {
 *   tf: Object<string, number>,
 *   length: number,
 *   uniqueTerms: number,
 *   tokens: string[]
 * }}
 *
 * 当 output === "tokens"：
 *   - 返回最终 token 数组（string[]）
 *
 * 当 output === "stats"：
 *   - tf:
 *       Term Frequency（词频映射）
 *       key: token
 *       value: 出现次数（number）
 *
 *   - length:
 *       token 总数
 *
 *   - uniqueTerms:
 *       去重后的 token 数量
 *
 *   - tokens:
 *       最终 token 数组（便于 debug / 分析）
 *
 *
 * 设计说明：
 * - tokenizeFinal 是唯一推荐的对外调用入口
 * - 作为 Search / Index / Similarity 的基础组件
 */
function tokenizeFinal(text, options = {}) {
    const { output = "tokens", postOptions = {} } = options;

    // 1) Model（core + policy）
    const modelTokens = tokenize(text, { ...options, output: "tokens" });

    // 2) Post（后处理）
    const cleanedTokens = postProcessTokens(modelTokens, {
        // 中文注释：默认避免“双删 stopwords”
        // stopwords 留给 Model/policy，post 只做工程清洗（限流/长度/噪声）
        removeStopwords: false,
        removeZhStopwords: false,
        ...postOptions,
    });

    // 3) final output
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
