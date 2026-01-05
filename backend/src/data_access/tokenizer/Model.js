// backend/src/data_access/tokenizer/Model.js
// pipeline：
//   1) core tokenize（mixedTokenizeCore）
//   2) policy（停用词 Stopwords / 数字 Numbers / CJK bigram 噪声）
//   3) post（后处理 Post-tokenization：限流/长度/噪声）
// 对外导出：
//   - tokenize：只跑 core + policy（适合你想单独调试 core/policy）
//   - tokenizeFinal：跑完整 pipeline（Model -> Post -> Final answer）
//
// query 模式：CJK single + bigram 融合，提高召回（recall）

"use strict";

const { tokenizeMixed } = require("./mixedTokenizeCore");
const { STOPWORDS_EN, STOPWORDS_ZH, CJK_NOISE_CHARS } = require("./StopWords");
const { postProcessTokens } = require("./PostTokenization");

function looksLikeCJK(t) {
    return /[\u3400-\u4DBF\u4E00-\u9FFF]/.test(t[0] || "");
}

function looksLikeEnglishWord(t) {
    return /^[a-z]+$/.test(t);
}

function isNumeric(t) {
    return /^\d+$/.test(t);
}

function isCjkBigramNoise(t) {
    if (!t || t.length !== 2) return false;
    if (!looksLikeCJK(t)) return false;

    // 中文注释：只在“两个字都属于高频虚词/功能字噪声集”时才判噪声
    // 这样不会误杀：图书、书馆、计算、机系 等
    return CJK_NOISE_CHARS.has(t[0]) && CJK_NOISE_CHARS.has(t[1]);
}

function makeTF(tokens) {
    const tf = Object.create(null);
    for (const t of tokens) tf[t] = (tf[t] || 0) + 1;
    return tf;
}

// 合并 tokens（去重）
function mergeTokensUnique(a, b) {
    return [...new Set([...(a || []), ...(b || [])])];
}

// 合并 TF（可加权）
function mergeTF(tfA, tfB, weightB = 1) {
    const out = Object.create(null);
    if (tfA) {
        for (const k in tfA) out[k] = (out[k] || 0) + tfA[k];
    }
    if (tfB) {
        for (const k in tfB) out[k] = (out[k] || 0) + tfB[k] * weightB;
    }
    return out;
}

// 把 policy（停用词/数字/噪声）应用到 token 列表
function applyPolicy(tokens, { enableStopwords, keepNumbers, dropCjkNoiseBigrams }) {
    let out = tokens;

    if (!keepNumbers) {
        out = out.filter((t) => !isNumeric(t));
    }

    if (enableStopwords) {
        out = out.filter((t) => {
            if (looksLikeEnglishWord(t) && STOPWORDS_EN.has(t)) return false;
            if (looksLikeCJK(t) && STOPWORDS_ZH.has(t)) return false;
            return true;
        });
    }

    if (dropCjkNoiseBigrams) {
        out = out.filter((t) => !isCjkBigramNoise(t));
    }

    return out;
}

// core tokenize（只负责切分，不含 policy）
function coreTokenize(text, coreOptions) {
    return tokenizeMixed(text, coreOptions);
}

/** =========================
 * Public API 1: tokenize（core + policy）
 * =========================
 *
 * mode:
 * - "document": 给文件建索引用（indexing）
 * - "query":    给用户查询用（search），会做 CJK single+bigram 融合
 */
function tokenize(text, options = {}) {
    const {
        output = "tokens",

        // 模式 mode（默认 document）
        mode = "document", // "document" | "query"

        // core（分词核心 core tokenization）
        cjkMode = "bigram",
        keepCjkSingles = true,
        lowerCaseLatin = true,
        splitCamel = true,
        minTokenLength = 1,
        keepJoinedLatin = true,
        keepSplitLatinParts = false,

        // policy（策略 policy）
        enableStopwords = true,
        keepNumbers = true,
        dropCjkNoiseBigrams = true,

        // query 融合权重：bigram 的权重（可调）
        queryBigramWeight = 1,
    } = options;

    if (typeof text !== "string" || text.length === 0) {
        if (output === "stats") {
            return { tf: Object.create(null), length: 0, uniqueTerms: 0, tokens: [] };
        }
        return [];
    }

    // 统一 core 参数
    const coreBase = {
        keepCjkSingles,
        lowerCaseLatin,
        splitCamel,
        minTokenLength,
        emitJoinedLatin: keepJoinedLatin,
        emitSplitLatin: keepSplitLatinParts,
    };

    let tokens;

    if (mode === "query") {
        // 查询模式：CJK single + bigram 融合
        const tokensSingle = coreTokenize(text, { ...coreBase, cjkMode: "single" });
        const tokensBigram = coreTokenize(text, { ...coreBase, cjkMode: "bigram" });

        // policy 分别处理再合并（更稳定）
        const pSingle = applyPolicy(tokensSingle, { enableStopwords, keepNumbers, dropCjkNoiseBigrams });
        const pBigram = applyPolicy(tokensBigram, { enableStopwords, keepNumbers, dropCjkNoiseBigrams });

        // 合并 tokens：去重
        tokens = mergeTokensUnique(pSingle, pBigram);

        if (output === "stats") {
            const tfSingle = makeTF(pSingle);
            const tfBigram = makeTF(pBigram);
            const tf = mergeTF(tfSingle, tfBigram, queryBigramWeight);
            return { tf, length: tokens.length, uniqueTerms: Object.keys(tf).length, tokens };
        }

        return tokens;
    }

    // document（默认）：按你原本的 cjkMode 跑
    tokens = coreTokenize(text, { ...coreBase, cjkMode });

    // policy
    tokens = applyPolicy(tokens, { enableStopwords, keepNumbers, dropCjkNoiseBigrams });

    if (output === "stats") {
        const tf = makeTF(tokens);
        return { tf, length: tokens.length, uniqueTerms: Object.keys(tf).length, tokens };
    }

    return tokens;
}

module.exports = { tokenize};
