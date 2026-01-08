/**
 * Normalization.js - Text normalization
 * 
 * Unicode normalization, case folding, whitespace handling.
 */

function normalizeText(input, options = {}) {
    const {
        unicodeForm = "NFKC",
        lowerCase = true,
        keepNewlines = false,
        removeControlChars = true,
        collapseWhitespace = true,
        trim = true
    } = options;

    if (input == null) return "";

    let text = String(input);

    // 1) Unicode normalization
    try {
        text = text.normalize(unicodeForm);
    } catch {
    }

    // 2) Normalize line endings
    text = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

    // 3) Remove control characters
    if (removeControlChars) {
        if (keepNewlines) {
            text = text.replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, "");
        } else {
            text = text.replace(/[\u0000-\u001F\u007F]/g, "");
        }
    }

    // 4) Case folding
    if (lowerCase) text = text.toLowerCase();

    // 5) Whitespace handling
    if (collapseWhitespace) {
        if (keepNewlines) {
            text = text
                .replace(/[ \t\f\v]+/g, " ")
                .replace(/\n{3,}/g, "\n\n");
        } else {
            text = text.replace(/\s+/g, " ");
        }
    }

    if (trim) text = text.trim();

    return text;
}

module.exports = { normalizeText };
