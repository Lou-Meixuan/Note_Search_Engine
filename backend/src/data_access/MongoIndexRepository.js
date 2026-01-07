const { IIndexRepository } = require('../data_access/IIndexRepository');
const { InvertedIndex, DocStats } = require('../entity/IndexTypes');
const { IndexModel } = require('../data_access/mongodb');

/**
 * MongoIndexRepository
 *
 * 实现 IIndexRepository 接口，使用 MongoDB 存储索引数据
 *
 * 存储策略：
 * - 倒排索引（InvertedIndex）存储为 type: "inverted"
 * - 文档统计（DocStats）存储为 type: "docstats"
 * - 使用 upsert 确保每种类型只有一份数据
 */
class MongoIndexRepository extends IIndexRepository {
    /**
     * 保存整个倒排索引
     *
     * @param {InvertedIndex} index - 倒排索引对象
     * @returns {Promise<void>}
     */
    async saveIndex(index) {
        const indexData = index.toJSON();

        await IndexModel.findOneAndUpdate(
            { type: 'inverted' },
            {
                type: 'inverted',
                data: indexData,
                updatedAt: new Date()
            },
            {
                upsert: true,  // 如果不存在则创建，存在则更新
                new: true
            }
        );

        console.log('Saved inverted index to MongoDB');
    }

    /**
     * 获取整个倒排索引
     *
     * @returns {Promise<InvertedIndex>} 倒排索引对象
     */
    async getIndex() {
        const doc = await IndexModel.findOne({ type: 'inverted' });

        if (!doc) {
            // 如果索引不存在，返回空索引
            console.log('No inverted index found in MongoDB, returning empty index');
            return new InvertedIndex();
        }

        // 从JSON数据恢复InvertedIndex对象
        return InvertedIndex.fromJSON(doc.data);
    }

    /**
     * 获取某个词条的倒排列表 (Posting List)
     *
     * @param {string} term - 分词后的词条
     * @returns {Promise<PostingItem[]|null>} 倒排列表，词不存在则返回空数组
     */
    async getPostingList(term) {
        const index = await this.getIndex();
        const postings = index.getPostingList(term);

        // 根据接口定义，词不存在应返回null，但InvertedIndex返回空数组
        // 为了保持一致性，空数组也返回空数组（不是null）
        return postings.length > 0 ? postings : [];
    }

    /**
     * 保存文档统计信息（用于 TF-IDF / BM25 计算）
     *
     * @param {DocStats} stats - 文档统计信息
     * @returns {Promise<void>}
     */
    async saveDocStats(stats) {
        const statsData = stats.toJSON();

        await IndexModel.findOneAndUpdate(
            { type: 'docstats' },
            {
                type: 'docstats',
                data: statsData,
                updatedAt: new Date()
            },
            {
                upsert: true,
                new: true
            }
        );

        console.log('Saved doc stats to MongoDB');
    }

    /**
     * 获取文档统计信息
     *
     * @returns {Promise<DocStats>} 文档统计信息
     */
    async getDocStats() {
        const doc = await IndexModel.findOne({ type: 'docstats' });

        if (!doc) {
            // 如果统计信息不存在，返回空统计
            console.log('No doc stats found in MongoDB, returning empty stats');
            return new DocStats();
        }

        // 从JSON数据恢复DocStats对象
        return DocStats.fromJSON(doc.data);
    }

    /**
     * 清空索引（重建索引时使用）
     *
     * @returns {Promise<void>}
     */
    async clearIndex() {
        const result = await IndexModel.deleteMany({
            type: { $in: ['inverted', 'docstats'] }
        });

        console.log(`Cleared ${result.deletedCount} index documents from MongoDB`);
    }
}

// 注意：使用 module.exports = 直接导出类（与MongoDocumentRepository一致）
module.exports = MongoIndexRepository;