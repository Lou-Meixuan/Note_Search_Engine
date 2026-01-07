/**
 * SearchDocumentsController
 * 
 * Created by: C
 * Date: 2026-01-06
 * 
 * 【Clean Architecture - Interface Adapters Layer】
 * Controller 的职责:
 * 1. 接收 HTTP 请求参数
 * 2. 转换为 Use Case 需要的 Input Data
 * 3. 调用 Use Case
 * 4. 返回结果
 * 
 * Controller 不应该包含业务逻辑！
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
        // 1. Extract and validate query parameters / 提取并验证查询参数
        const q = (queryParams.q || "").toString().trim();
        const scope = (queryParams.scope || "all").toString().toLowerCase();

        // Validate scope / 验证 scope
        const validScopes = ["local", "remote", "all"];
        const normalizedScope = validScopes.includes(scope) ? scope : "all";

        // 2. Create dependencies / 创建依赖
        // 【Dependency Injection at the Controller level】
        // Controller 负责组装 Use Case 需要的依赖
        const documentRepository = new MongoDocumentRepository();

        // 3. Create and execute Use Case / 创建并执行 Use Case
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
