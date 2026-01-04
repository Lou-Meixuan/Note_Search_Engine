/**
 * IIndexRepository - 倒排索引存储接口（抽象基类）
 * 
 * 【设计模式：Repository Pattern】
 * 这个接口定义了索引的存取方法，具体实现可以是：
 * - 内存（开发/测试用）
 * - 文件系统（JSON 文件）
 * - 数据库（生产环境）
 * 
 * 使用者：
 * - L (BuildIndex): 使用 saveIndex() 保存构建好的索引
 * - C (SearchDocuments): 使用 getIndex() / getPostingList() 读取索引进行搜索
 * 
 * ============================================================
 * 【Java 对照】
 * 
 * public interface IIndexRepository {
 *     void saveIndex(InvertedIndex index);
 *     InvertedIndex getIndex();
 *     List<PostingItem> getPostingList(String term);
 *     void saveDocStats(DocStats stats);
 *     DocStats getDocStats();
 * }
 * ============================================================
 */
class IIndexRepository {
    /**
     * 保存整个倒排索引
     * 
     * 【使用者】L (BuildIndex)
     * 
     * 【调用示例】
     * const index = new InvertedIndex();
     * index.addPosting("machine", new PostingItem({ docId: "doc-1", tf: 3 }));
     * // ... 添加更多
     * await indexRepository.saveIndex(index);
     * 
     * @param {InvertedIndex} index - 倒排索引对象
     * @returns {Promise<void>}
     */
    async saveIndex(index) {
        throw new Error("Method not implemented: saveIndex()");
    }

    /**
     * 获取整个倒排索引
     * 
     * 【使用者】C (SearchDocuments)
     * 
     * 【调用示例】
     * const index = await indexRepository.getIndex();
     * const postings = index.getPostingList("machine");
     * 
     * @returns {Promise<InvertedIndex>} 倒排索引对象
     */
    async getIndex() {
        throw new Error("Method not implemented: getIndex()");
    }

    /**
     * 获取某个词条的倒排列表 (Posting List)
     * 
     * 【使用者】C (SearchDocuments)
     * 
     * 【调用示例】
     * const postings = await indexRepository.getPostingList("machine");
     * // postings: [{ docId: "doc-1", tf: 3 }, { docId: "doc-2", tf: 1 }]
     * 
     * 【为什么单独提供这个方法？】
     * 如果索引很大，不需要加载整个索引到内存，
     * 只需要查询需要的词条即可。
     * 
     * @param {string} term - 分词后的词条
     * @returns {Promise<PostingItem[]|null>} 倒排列表，词不存在则返回 null
     */
    async getPostingList(term) {
        throw new Error("Method not implemented: getPostingList()");
    }

    /**
     * 保存文档统计信息（用于 TF-IDF / BM25 计算）
     * 
     * 【使用者】L (BuildIndex)
     * 
     * 【调用示例】
     * const docStats = new DocStats();
     * docStats.addDoc("doc-1", { length: 200, source: "local", title: "Note 1" });
     * // ... 添加更多
     * await indexRepository.saveDocStats(docStats);
     * 
     * @param {DocStats} stats - 文档统计信息
     * @returns {Promise<void>}
     */
    async saveDocStats(stats) {
        throw new Error("Method not implemented: saveDocStats()");
    }

    /**
     * 获取文档统计信息
     * 
     * 【使用者】C (SearchDocuments)
     * 
     * 【调用示例】
     * const docStats = await indexRepository.getDocStats();
     * console.log(docStats.totalDocs);       // 总文档数
     * console.log(docStats.avgDocLength);    // 平均文档长度
     * 
     * @returns {Promise<DocStats>} 文档统计信息
     */
    async getDocStats() {
        throw new Error("Method not implemented: getDocStats()");
    }

    /**
     * 清空索引（重建索引时使用）
     * 
     * 【使用者】L (BuildIndex) - 全量重建索引前先清空
     * 
     * @returns {Promise<void>}
     */
    async clearIndex() {
        throw new Error("Method not implemented: clearIndex()");
    }
}

module.exports = { IIndexRepository };
