/**
 * PreTokenization.js - Pre-tokenization step
 * 
 * Splits normalized text into chunks (sentences/lines) before final tokenization.
 */

function preTokenizeText(normalizedText, options = {}) {
    const {
        keepNewlines = false,
        splitSentences = true,
        minChunkLength = 1,
        splitOnSeparators = true,
        protectPatterns = false,
    } = options;

    if (normalizedText == null) return [];
    let text = String(normalizedText);

    // 1) Protect special patterns (URL / Email)
    const placeholders = [];
    if (protectPatterns) {
        const patterns = [
            /https?:\/\/[^\s]+/gi,
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

    // 2) Split by newlines
    let roughChunks;
    if (keepNewlines) {
        roughChunks = text.split("\n");
    } else {
        roughChunks = [text.replace(/\n+/g, " ")];
    }

    // 3) Sentence splitting
    const sentenceSplitRegex = /([.!?。！？]+)(\s+)/g;
    const sentenceSplitRegexNoSpace = /([.!?。！？]+)(?!\s|$)/g;

    const afterSentenceSplit = [];
    if (splitSentences) {
        for (const chunk of roughChunks) {
            let c = chunk;
            c = c.replace(sentenceSplitRegex, "$1\n");
            c = c.replace(sentenceSplitRegexNoSpace, "$1\n");
            c = c.replace(/(…+)(\s+)/g, "$1\n");

            const parts = c.split("\n");
            for (const p of parts) afterSentenceSplit.push(p);
        }
    } else {
        afterSentenceSplit.push(...roughChunks);
    }

    // 4) Split on separators
    const finalChunks = [];
    if (splitOnSeparators) {
        const sepRegex = /[\/\\|,_:;()\[\]{}<>]+/g;
        const dashRegex = /[-_]+/g;

        for (const chunk of afterSentenceSplit) {
            const c = chunk
                .replace(sepRegex, " ")
                .replace(dashRegex, " ");
            const parts = c.split(/\s+/g);
            for (const p of parts) finalChunks.push(p);
        }
    } else {
        finalChunks.push(...afterSentenceSplit);
    }

    // 5) Restore placeholders
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

    // 6) Clean up
    const cleaned = restored
        .map((c) => c.trim())
        .filter((c) => c.length >= minChunkLength);

    return cleaned;
}

module.exports = { preTokenizeText };
