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
 * options:
 * - 继承 Model.tokenize 的所有 options（mode/queryBigramWeight 等）
 * - 新增 postOptions：传给 postProcessTokens
 *
 * output:
 * - "tokens"（默认）
 * - "stats"（TF term frequency + tokens）
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
