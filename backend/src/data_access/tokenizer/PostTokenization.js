/**
 * PostTokenization.js - Post-tokenization processing
 * 
 * Cleans, filters, and limits tokens after core tokenization.
 */

"use strict";

const DEFAULT_EN_STOPWORDS = new Set([
    "the","a","an","and","or","to","of","in","on","for","with","is","are","was","were",
    "be","been","being","as","at","by","from","that","this","it","its","but","not"
]);

const DEFAULT_ZH_STOPWORDS = new Set([
    "的", "是", "了", "在", "和", "与", "及", "也", "就", "都", "而", "但",
    "这", "那", "一个", "一些", "这种", "那种"
]);

function isTokenInfo(x) {
    return x && typeof x === "object" && "term" in x;
}

function isPureLatinWord(term) {
    return /^[a-z]+$/.test(term);
}

function isPureHan(term) {
    return /^\p{Script=Han}+$/u.test(term);
}

function looksLikeNoise(term) {
    if (/^[\p{P}\p{S}_]+$/u.test(term)) return true;
    if (/(.)\1{6,}/u.test(term)) return true;
    return false;
}

function postProcessTokens(tokens, options = {}) {
    const {
        removeStopwords = true,
        stopwords = DEFAULT_EN_STOPWORDS,
        removeZhStopwords = true,
        zhStopwords = DEFAULT_ZH_STOPWORDS,
        minTokenLength = 1,
        maxTokenLength = 64,
        maxTokens = Infinity,
        dropNumericOnly = false,
        dropNoiseTokens = true,
        dedupe = false,
    } = options;

    if (!Array.isArray(tokens)) return [];

    const inputIsInfo = tokens.length > 0 && isTokenInfo(tokens[0]);
    const out = [];
    const seen = dedupe ? new Set() : null;

    for (const item of tokens) {
        if (out.length >= maxTokens) break;

        const termRaw = inputIsInfo ? item.term : item;
        if (termRaw == null) continue;

        const term = String(termRaw).trim();
        if (!term) continue;

        // Length filter
        if (term.length < minTokenLength) continue;
        if (term.length > maxTokenLength) continue;

        // Numeric filter (optional)
        if (dropNumericOnly && /^\d+$/.test(term)) continue;

        // Noise filter (optional)
        if (dropNoiseTokens && looksLikeNoise(term)) continue;

        // Stopword filter
        if (removeStopwords && isPureLatinWord(term) && stopwords.has(term)) continue;
        if (removeZhStopwords && isPureHan(term) && zhStopwords.has(term)) continue;

        // Dedupe (not recommended for TF calculation)
        if (dedupe) {
            if (seen.has(term)) continue;
            seen.add(term);
        }

        if (inputIsInfo) {
            const position = Number(item.position);
            out.push({ term, position: Number.isFinite(position) ? position : -1 });
        } else {
            out.push(term);
        }
    }

    return out;
}

function postProcessToTfMap(tokens, options = {}) {
    const cleaned = postProcessTokens(tokens, options);
    const tf = Object.create(null);
    for (const term of cleaned) {
        tf[term] = (tf[term] ?? 0) + 1;
    }
    return tf;
}

module.exports = { postProcessTokens, postProcessToTfMap };
