/**
 * SearchDocumentsController.js - HTTP handler for document search
 */

const { SearchDocuments } = require("../../use_case/search_documents/SearchDocuments");
const MongoDocumentRepository = require("../MongoDocumentRepository");

class SearchDocumentsController {
    /**
     * Handle search request
     * 
     * @param {Object} queryParams - HTTP query parameters
     * @param {string} queryParams.q - Search query
     * @param {string} queryParams.scope - Search scope: "local" | "remote" | "all"
     * @returns {Object} Search results
     */
    async handle(queryParams) {
        // 1. Extract and validate query parameters
        const q = (queryParams.q || "").toString().trim();
        const scope = (queryParams.scope || "all").toString().toLowerCase();

        // Validate scope
        const validScopes = ["local", "remote", "all"];
        const normalizedScope = validScopes.includes(scope) ? scope : "all";

        // 2. Create dependencies
        // 【Dependency Injection at the Controller level】
        // Controller assembles dependencies for use case
        const documentRepository = new MongoDocumentRepository();

        // 3. Create and execute use case
        const useCase = new SearchDocuments({
            documentRepository
        });

        try {
            const result = await useCase.execute({
                q,
                scope: normalizedScope
            });

            return result;
        } catch (error) {
            console.error("[SearchDocumentsController] Error:", error);
            return {
                query: q,
                scope: normalizedScope,
                totalResults: 0,
                results: [],
                error: error.message
            };
        }
    }
}

module.exports = { SearchDocumentsController };
