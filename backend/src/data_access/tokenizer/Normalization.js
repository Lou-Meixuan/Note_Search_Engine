/**
 * Normalization（规范化）
 * 输入: 原始文本 string
 * 输出: 规范化后的文本 string
 */
function normalizeText(input, options = {}) {
    const {
        unicodeForm = "NFKC",     // Unicode normalization: "NFKC" / "NFC"
        lowerCase = true,         // 是否统一小写（case folding）
        keepNewlines = false,     // 是否保留换行（true: 保留 \n；false: 全部压成空格）
        removeControlChars = true,// 是否移除控制字符
        collapseWhitespace = true,// 是否压缩多余空白
        trim = true               // 是否去掉首尾空白
    } = options;

    if (input == null) return "";

    let text = String(input);

    // 1) Unicode 规范化（处理全角/半角、兼容字符等）
    try {
        text = text.normalize(unicodeForm);
    } catch {
    }

    // 2) 统一换行符
    text = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

    // 3) 移除控制字符
    if (removeControlChars) {
        if (keepNewlines) {
            // 保留 \n（0x0A）
            text = text.replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, "");
        } else {
            text = text.replace(/[\u0000-\u001F\u007F]/g, "");
        }
    }

    // 4) 大小写折叠
    if (lowerCase) text = text.toLowerCase();

    // 5) 空白处理
    if (collapseWhitespace) {
        if (keepNewlines) {
            text = text
                .replace(/[ \t\f\v]+/g, " ")
                .replace(/\n{3,}/g, "\n\n"); // 最多保留双换行（可按你需求调整）
        } else {
            text = text.replace(/\s+/g, " ");
        }
    }

    if (trim) text = text.trim();

    return text;
}

module.exports = { normalizeText };
