/**
 * SearchResult 实体 - C (SearchDocuments) 返回的搜索结果
 * 
 * 这个类表示一条搜索结果，包含文档的基本信息和相关性得分
 * 
 * ============================================================
 * 【Java 对照】
 * 
 * public class SearchResult {
 *     private String docId;
 *     private String title;
 *     private String snippet;
 *     private double score;
 *     private String source;
 *     
 *     // constructor, getters...
 * }
 * ============================================================
 */
class SearchResult {
    /**
     * @param {Object} params - 使用解构参数，调用时更清晰
     * @param {string} params.docId - 文档 ID（用于跳转到详情页）
     * @param {string} params.title - 文档标题（显示在搜索结果列表）
     * @param {string} params.snippet - 摘要片段（包含高亮的关键词）
     * @param {number} params.score - 相关性得分 (TF-IDF / BM25 计算结果)
     * @param {string} params.source - 来源: "local" | "remote"
     */
    constructor({ docId, title, snippet, score, source }) {
        this.docId = docId;
        this.title = title;
        this.snippet = snippet;
        this.score = score;
        this.source = source;
    }

    /**
     * 转换为普通对象
     * 
     * 【使用场景】
     * Controller 返回 JSON 响应时会自动调用 toJSON()
     * 或手动调用 JSON.stringify(result) 时
     */
    toJSON() {
        return {
            docId: this.docId,
            title: this.title,
            snippet: this.snippet,
            score: this.score,
            source: this.source
        };
    }
}

module.exports = { SearchResult };
