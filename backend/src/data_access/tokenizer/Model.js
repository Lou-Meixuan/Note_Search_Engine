/**
 * Model.js - Tokenization model with policy filters
 * 
 * Exports: tokenize (core + policy)
 * Handles: stopwords, CJK bigrams, numeric filtering
 */

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
    return CJK_NOISE_CHARS.has(t[0]) && CJK_NOISE_CHARS.has(t[1]);
}

function makeTF(tokens) {
    const tf = Object.create(null);
    for (const t of tokens) tf[t] = (tf[t] || 0) + 1;
    return tf;
}

function mergeTokensUnique(a, b) {
    return [...new Set([...(a || []), ...(b || [])])];
}

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

function coreTokenize(text, coreOptions) {
    return tokenizeMixed(text, coreOptions);
}

/**
 * Tokenize text with core tokenization and policy filters
 * 
 * @param {string} text - Input text
 * @param {Object} options
 * @param {"tokens"|"stats"} options.output - Output format
 * @param {"document"|"query"} options.mode - Tokenization mode
 * @returns {string[]|Object} Tokens or stats object
 */
function tokenize(text, options = {}) {
    const {
        output = "tokens",
        mode = "document",
        cjkMode = "bigram",
        keepCjkSingles = true,
        lowerCaseLatin = true,
        splitCamel = true,
        minTokenLength = 1,
        keepJoinedLatin = true,
        keepSplitLatinParts = false,
        enableStopwords = true,
        keepNumbers = true,
        dropCjkNoiseBigrams = true,
        queryBigramWeight = 1,
    } = options;

    if (typeof text !== "string" || text.length === 0) {
        if (output === "stats") {
            return { tf: Object.create(null), length: 0, uniqueTerms: 0, tokens: [] };
        }
        return [];
    }

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
        // Query mode: CJK single + bigram fusion for better recall
        const tokensSingle = coreTokenize(text, { ...coreBase, cjkMode: "single" });
        const tokensBigram = coreTokenize(text, { ...coreBase, cjkMode: "bigram" });

        const pSingle = applyPolicy(tokensSingle, { enableStopwords, keepNumbers, dropCjkNoiseBigrams });
        const pBigram = applyPolicy(tokensBigram, { enableStopwords, keepNumbers, dropCjkNoiseBigrams });

        tokens = mergeTokensUnique(pSingle, pBigram);

        if (output === "stats") {
            const tfSingle = makeTF(pSingle);
            const tfBigram = makeTF(pBigram);
            const tf = mergeTF(tfSingle, tfBigram, queryBigramWeight);
            return { tf, length: tokens.length, uniqueTerms: Object.keys(tf).length, tokens };
        }

        return tokens;
    }

    // Document mode (default)
    tokens = coreTokenize(text, { ...coreBase, cjkMode });
    tokens = applyPolicy(tokens, { enableStopwords, keepNumbers, dropCjkNoiseBigrams });

    if (output === "stats") {
        const tf = makeTF(tokens);
        return { tf, length: tokens.length, uniqueTerms: Object.keys(tf).length, tokens };
    }

    return tokens;
}

module.exports = { tokenize };
