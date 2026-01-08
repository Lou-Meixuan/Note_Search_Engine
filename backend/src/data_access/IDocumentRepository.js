/**
 * IDocumentRepository.js - Document repository interface (abstract base class)
 * 
 * Repository pattern: separates data access from business logic.
 */

class IDocumentRepository {
    /**
     * Save a document
     * @param {Document} document
     * @returns {Promise<void>}
     */
    async save(document) {
        throw new Error("Method not implemented: save()");
    }

    /**
     * Get all documents
     * @returns {Promise<Document[]>}
     */
    async findAll() {
        throw new Error("Method not implemented: findAll()");
    }

    /**
     * Get documents by source
     * @param {string} source - "local" | "remote"
     * @returns {Promise<Document[]>}
     */
    async findBySource(source) {
        throw new Error("Method not implemented: findBySource()");
    }

    /**
     * Get document by ID
     * @param {string} id
     * @returns {Promise<Document|null>}
     */
    async findById(id) {
        throw new Error("Method not implemented: findById()");
    }

    /**
     * Delete document by ID
     * @param {string} id
     * @returns {Promise<boolean>}
     */
    async deleteById(id) {
        throw new Error("Method not implemented: deleteById()");
    }
}

module.exports = { IDocumentRepository };
