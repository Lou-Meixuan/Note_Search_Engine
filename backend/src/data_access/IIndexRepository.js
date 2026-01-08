/**
 * IIndexRepository.js - Index repository interface (abstract base class)
 * 
 * Repository pattern for inverted index storage.
 */

class IIndexRepository {
    /**
     * Save inverted index
     * @param {InvertedIndex} index
     * @returns {Promise<void>}
     */
    async saveIndex(index) {
        throw new Error("Method not implemented: saveIndex()");
    }

    /**
     * Get inverted index
     * @returns {Promise<InvertedIndex>}
     */
    async getIndex() {
        throw new Error("Method not implemented: getIndex()");
    }

    /**
     * Get posting list for a term
     * @param {string} term
     * @returns {Promise<PostingItem[]|null>}
     */
    async getPostingList(term) {
        throw new Error("Method not implemented: getPostingList()");
    }

    /**
     * Save document statistics
     * @param {DocStats} stats
     * @returns {Promise<void>}
     */
    async saveDocStats(stats) {
        throw new Error("Method not implemented: saveDocStats()");
    }

    /**
     * Get document statistics
     * @returns {Promise<DocStats>}
     */
    async getDocStats() {
        throw new Error("Method not implemented: getDocStats()");
    }

    /**
     * Clear index (used before rebuild)
     * @returns {Promise<void>}
     */
    async clearIndex() {
        throw new Error("Method not implemented: clearIndex()");
    }
}

module.exports = { IIndexRepository };
