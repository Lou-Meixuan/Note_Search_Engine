// tokenizer/Pre_Tokenization.js

/**
 * Pre-tokenization（预分词）
 * 输入：已经做过 Normalization（规范化）的字符串
 * 输出：chunks（文本片段）数组 string[]
 *
 * 目标：把文本先拆成“结构清晰”的片段（句子/行），为后续 token split 做准备
 * 注意：这里不产出最终 tokens（token），只产出 chunks
 */
function preTokenizeText(normalizedText, options = {}) {
    const {
        // 是否保留换行的语义（比如将每行当作一个 chunk）
        // 搜索引擎默认 false 也可以；但如果你之后要做 snippet（摘要）更建议 true
        keepNewlines = false,

        // 是否做句子切分（sentence split）
        // 英文：. ! ?；中文：。！？；以及省略号…
        splitSentences = true,

        // 最小 chunk 长度：太短的片段通常是噪音（比如只剩一个标点）
        minChunkLength = 1,

        // 是否把常见“强分隔符”周围切开（hard separators）
        // 例如：/ - _ | ( ) [ ] { } , ; : 等
        splitOnSeparators = true,

        // 是否保护一些特殊模式（pattern isolation）：
        // 先把 URL / Email 当成整体，不被后续简单切分打碎
        // MVP 可以先关掉；想更强再开
        protectPatterns = false,
    } = options;

    if (normalizedText == null) return [];
    let text = String(normalizedText);

    // 1) 可选：保护特殊模式（URL / Email）
    // 做法：先把这些模式替换成占位符，切分完成后再还原
    const placeholders = [];
    if (protectPatterns) {
        const patterns = [
            // URL（简化版，足够实用）
            /https?:\/\/[^\s]+/gi,
            // Email（简化版）
            /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi,
        ];

        for (const re of patterns) {
            text = text.replace(re, (match) => {
                const key = `__P${placeholders.length}__`;
                placeholders.push({ key, value: match });
                return key;
            });
        }
    }

    // 2) 先按换行切：保留结构的第一层
    // - keepNewlines=true：每行一个 chunk（更适合笔记/段落）
    // - keepNewlines=false：把换行当作空格（你的 Normalization 里也可能已经做了）
    let roughChunks;
    if (keepNewlines) {
        roughChunks = text.split("\n");
    } else {
        // 不保留换行语义：当作空格再统一切分
        roughChunks = [text.replace(/\n+/g, " ")];
    }

    // 3) 可选：句子级切分（sentence split）
    // 用“在句末标点后插入换行”再 split 的方式实现，简单稳定
    const sentenceSplitRegex = /([.!?。！？]+)(\s+)/g; // 标点后跟空白
    const sentenceSplitRegexNoSpace = /([.!?。！？]+)(?!\s|$)/g; // 标点后不跟空白（比如"Hi!Hello"）

    const afterSentenceSplit = [];
    if (splitSentences) {
        for (const chunk of roughChunks) {
            let c = chunk;

            // 在句末标点后制造边界
            c = c.replace(sentenceSplitRegex, "$1\n");
            c = c.replace(sentenceSplitRegexNoSpace, "$1\n");

            // 中文省略号 / unicode 省略号（可选增强）
            c = c.replace(/(…+)(\s+)/g, "$1\n");

            // 拆开
            const parts = c.split("\n");
            for (const p of parts) afterSentenceSplit.push(p);
        }
    } else {
        afterSentenceSplit.push(...roughChunks);
    }

    // 4) 可选：强分隔符切分（hard separators）
    // 目的：把 “video-edit_engine/2026” 这种结构先拆成更安全的片段
    const finalChunks = [];
    if (splitOnSeparators) {
        // 把分隔符两边“打断”为边界（但不丢掉信息）
        // 这里策略是：把分隔符替换成空格，作为 chunk 内部的断点
        // 你也可以把它们保留为独立 token（那是 tokenization core 的事）
        const sepRegex = /[\/\\|,_:;()\[\]{}<>]+/g;
        const dashRegex = /[-_]+/g; // 连字符/下划线作为结构分隔

        for (const chunk of afterSentenceSplit) {
            const c = chunk
                .replace(sepRegex, " ")
                .replace(dashRegex, " ");
            // 再按空格切成更小的“子片段”，但仍然是 chunks（不是最终 tokens）
            // 这样做的好处：后续 token split 用更简单的规则也能稳定
            const parts = c.split(/\s+/g);
            for (const p of parts) finalChunks.push(p);
        }
    } else {
        finalChunks.push(...afterSentenceSplit);
    }

    // 5) 还原占位符（如果启用 protectPatterns）
    let restored = finalChunks;
    if (protectPatterns && placeholders.length > 0) {
        restored = finalChunks.map((c) => {
            let out = c;
            for (const { key, value } of placeholders) {
                if (out.includes(key)) out = out.replaceAll(key, value);
            }
            return out;
        });
    }

    // 6) 清理：去空、去太短
    const cleaned = restored
        .map((c) => c.trim())
        .filter((c) => c.length >= minChunkLength);

    return cleaned;
}

module.exports = { preTokenizeText };
