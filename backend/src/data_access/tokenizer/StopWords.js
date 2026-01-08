/**
 * StopWords.js - Stopwords and CJK noise character sets
 */

"use strict";

// English stopwords
const STOPWORDS_EN = new Set([
    "the", "a", "an", "and", "or", "to", "of", "in", "on", "for", "with",
    "is", "are", "was", "were", "be", "been", "it", "this", "that",
]);

// Chinese stopwords
const STOPWORDS_ZH = new Set([
    "的", "是", "了", "在", "有", "和", "与", "及", "也", "都", "就",
    "这", "那", "一个", "我们", "你们", "他们",
    "我", "你", "他", "她", "它", "们",
]);

// CJK bigram noise characters
const CJK_NOISE_CHARS = new Set([
    "的", "是", "了",
    "我", "你", "他", "她", "它", "们",
    "很", "也", "都", "就", "还", "又",
    "对", "把", "被", "给", "跟", "向",
    "来", "去", "说", "讲",
    "真", "确", "其", "而",
    "这", "那",
]);

module.exports = {
    STOPWORDS_EN,
    STOPWORDS_ZH,
    CJK_NOISE_CHARS,
};
