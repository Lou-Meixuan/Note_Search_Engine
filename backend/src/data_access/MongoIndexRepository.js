/**
 * MongoIndexRepository.js - MongoDB implementation of index repository
 * 
 * Stores inverted index and document stats in MongoDB.
 */

const { IIndexRepository } = require('../data_access/IIndexRepository');
const { InvertedIndex, DocStats } = require('../entity/IndexTypes');
const { IndexModel } = require('../data_access/mongodb');

class MongoIndexRepository extends IIndexRepository {
    /**
     * Save inverted index
     * @param {InvertedIndex} index
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
                upsert: true,
                new: true
            }
        );

        console.log('Saved inverted index to MongoDB');
    }

    /**
     * Get inverted index
     * @returns {Promise<InvertedIndex>}
     */
    async getIndex() {
        const doc = await IndexModel.findOne({ type: 'inverted' });

        if (!doc) {
            console.log('No inverted index found in MongoDB, returning empty index');
            return new InvertedIndex();
        }

        return InvertedIndex.fromJSON(doc.data);
    }

    /**
     * Get posting list for a term
     * @param {string} term
     * @returns {Promise<PostingItem[]>}
     */
    async getPostingList(term) {
        const index = await this.getIndex();
        const postings = index.getPostingList(term);
        return postings.length > 0 ? postings : [];
    }

    /**
     * Save document stats
     * @param {DocStats} stats
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
     * Get document stats
     * @returns {Promise<DocStats>}
     */
    async getDocStats() {
        const doc = await IndexModel.findOne({ type: 'docstats' });

        if (!doc) {
            console.log('No doc stats found in MongoDB, returning empty stats');
            return new DocStats();
        }

        return DocStats.fromJSON(doc.data);
    }

    /**
     * Clear index (used before rebuild)
     * @returns {Promise<void>}
     */
    async clearIndex() {
        const result = await IndexModel.deleteMany({
            type: { $in: ['inverted', 'docstats'] }
        });

        console.log(`Cleared ${result.deletedCount} index documents from MongoDB`);
    }
}

module.exports = MongoIndexRepository;
