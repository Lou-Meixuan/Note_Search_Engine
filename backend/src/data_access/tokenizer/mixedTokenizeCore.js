/**
 * mixedTokenizeCore.js - Core tokenization logic
 * 
 * Handles mixed Chinese/English text with CJK bigrams and camelCase splitting.
 */

"use strict";

/** =========================
 * Utils (internal)
 * ========================= */
function splitCamelCase(token) {
    // VideoEditEngine2026 => ["Video","Edit","Engine","2026"]
    const parts = token.match(/[A-Z]?[a-z]+|[A-Z]+(?![a-z])|\d+/g);
    return parts ? parts : [token];
}

function isCJKChar(ch) {
    return /[\u3400-\u4DBF\u4E00-\u9FFF]/.test(ch);
}

function isLatinOrDigit(ch) {
    return /[A-Za-z0-9]/.test(ch);
}

/** =========================
 * Core tokenizer
 * ========================= */
function tokenizeMixed(text, options = {}) {
    const {
        // CJK
        cjkMode = "bigram",      // "span" | "char" | "bigram"
        keepCjkSingles = true,

        // Latin
        lowerCaseLatin = true,
        splitCamel = true,
        minTokenLength = 1,

        // Strategy
        emitJoinedLatin = true,
        emitSplitLatin = false,
    } = options;

    if (text == null) return [];
    const src = String(text);
    const tokens = [];

    let latinBuf = "";
    let cjkBuf = "";

    /** ---------- Latin ---------- */
    function pushLatin(raw) {
        if (!raw) return;

        const rawParts = raw.split(/[^A-Za-z0-9]+/).filter(Boolean);
        for (const part of rawParts) {
            const pieces = splitCamel ? splitCamelCase(part) : [part];
            for (let p of pieces) {
                if (!p) continue;
                if (lowerCaseLatin) p = p.toLowerCase();
                if (p.length >= minTokenLength) tokens.push(p);
            }
        }
    }

    function flushLatin() {
        if (!latinBuf) return;

        // split Latin
        pushLatin(latinBuf);

        // Joined Latin
        if (emitJoinedLatin) {
            let joined = lowerCaseLatin ? latinBuf.toLowerCase() : latinBuf;
            if (joined.length >= minTokenLength) tokens.push(joined);
        }

        latinBuf = "";
    }

    /** ---------- CJK ---------- */
    function emitCjk(span) {
        if (!span) return;

        if (cjkMode === "span") {
            if (span.length >= minTokenLength) tokens.push(span);
            return;
        }

        if (cjkMode === "char") {
            for (const ch of span) {
                if (ch.length >= minTokenLength) tokens.push(ch);
            }
            return;
        }

        // In bigram mode, optionally keep single chars
        if (keepCjkSingles) {
            for (const ch of span) {
                if (ch.length >= minTokenLength) tokens.push(ch);
            }
        }

        if (span.length === 1) {
            // Span length is 1, already pushed
            return;
        }

        for (let i = 0; i < span.length - 1; i++) {
            const bg = span[i] + span[i + 1];
            if (bg.length >= minTokenLength) tokens.push(bg);
        }
    }


    function flushCJK() {
        if (!cjkBuf) return;
        emitCjk(cjkBuf);
        cjkBuf = "";
    }

    /** ---------- scan ---------- */
    for (let i = 0; i < src.length; i++) {
        const ch = src[i];

        if (isLatinOrDigit(ch)) {
            flushCJK();
            latinBuf += ch;
            continue;
        }

        if (isCJKChar(ch)) {
            flushLatin();
            cjkBuf += ch;
            continue;
        }

        // boundary
        flushLatin();
        flushCJK();
    }

    flushLatin();
    flushCJK();

    if (!emitSplitLatin) {
        const KEEP_SHORT = new Set(["ai", "ml", "cs", "ui", "ux"]);
        return tokens.filter((t) => {
            if (/^[a-z]+$/.test(t) && t.length <= 1) return false;
            if (/^[a-z]+$/.test(t) && t.length <= 3 && !KEEP_SHORT.has(t)) return false;
            if (/^\d+$/.test(t) && t.length <= 2) return false;
            return true;
        });
    }

    return tokens;
}

module.exports = { tokenizeMixed };
