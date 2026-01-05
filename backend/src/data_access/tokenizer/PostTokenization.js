// backend/src/data_access/tokenizer/Post_Tokenization.js
// 中文注释：搜索引擎版 Post-tokenization（后处理）
// 位置：一定在 Model（核心分词 core + policy）之后
// 作用：对“已经生成的 tokens”做清洗、过滤、限流（保护性能）
// 支持输入：
//   1) string[]                              -> 输出 string[]
//   2) { term: string, position: number }[]  -> 输出同结构（保留 position）

"use strict";

const DEFAULT_EN_STOPWORDS = new Set([
    "the","a","an","and","or","to","of","in","on","for","with","is","are","was","were",
    "be","been","being","as","at","by","from","that","this","it","its","but","not"
]);

// 中文停用词（保守版）：先解决最影响检索的高频虚词
// 说明：不要一上来就把「我/你/他」这类人称代词全删掉——笔记检索/对话检索里有时有用。
const DEFAULT_ZH_STOPWORDS = new Set([
    "的", "是", "了", "在", "和", "与", "及", "也", "就", "都", "而", "但",
    "这", "那", "一个", "一些", "这种", "那种"
]);

function isTokenInfo(x) {
    return x && typeof x === "object" && "term" in x;
}

// 只对英文单词做停用词判定，避免误伤中文/混合 token
function isPureLatinWord(term) {
    return /^[a-z]+$/.test(term);
}

// 仅中文（汉字）token：适用于中文单字 / 中文词 / 中文 bigram
function isPureHan(term) {
    return /^\p{Script=Han}+$/u.test(term);
}

// 过滤明显“垃圾 token”（比如纯符号、过多重复字符、超长 base64 片段等）
// 这里给你保守版本：你可以之后按数据再加强
function looksLikeNoise(term) {
    // 全是标点符号/下划线等
    if (/^[\p{P}\p{S}_]+$/u.test(term)) return true;

    // 过多重复（例如 "aaaaaa" 或 "哈哈哈哈哈"）——保守一点
    if (/(.)\1{6,}/u.test(term)) return true;

    return false;
}

function postProcessTokens(tokens, options = {}) {
    const {
        // 英文停用词（English stopwords）
        removeStopwords = true,
        stopwords = DEFAULT_EN_STOPWORDS,

        // 中文停用词（Chinese stopwords）
        // 单独开关，避免和英文 stopwords 混在一起
        removeZhStopwords = true,
        zhStopwords = DEFAULT_ZH_STOPWORDS,

        // 长度/数量约束（相当于 padding/truncation 的“搜索引擎版本”）
        minTokenLength = 1,
        maxTokenLength = 64,
        maxTokens = Infinity, // 每篇文档最多保留 token 数，保护性能/索引大小

        // 数字策略
        dropNumericOnly = false, // 是否丢弃纯数字 token（很多搜索引擎会保留数字；看你们需求）

        // 其它清洗
        dropNoiseTokens = true,  // 是否丢弃看起来像噪音的 token

        // 去重（一般不建议在这里做；BM25/TF 需要频次）
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

        // 长度过滤
        if (term.length < minTokenLength) continue;
        if (term.length > maxTokenLength) continue;

        // 纯数字过滤（可选）
        if (dropNumericOnly && /^\d+$/.test(term)) continue;

        // 噪音过滤（可选）
        if (dropNoiseTokens && looksLikeNoise(term)) continue;

        // 停用词过滤：
        // - 英文：只对纯英文词做（避免误伤混合 token）
        // - 中文：只对纯中文 token 做（适配中文单字/词/bigram）
        if (removeStopwords && isPureLatinWord(term) && stopwords.has(term)) continue;
        if (removeZhStopwords && isPureHan(term) && zhStopwords.has(term)) continue;

        // 去重（一般不建议开；会破坏 TF）
        if (dedupe) {
            if (seen.has(term)) continue;
            seen.add(term);
        }

        if (inputIsInfo) {
            // 保留 position，不做改写
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
