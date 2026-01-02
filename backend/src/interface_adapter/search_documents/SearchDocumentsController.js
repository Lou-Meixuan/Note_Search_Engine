const { SearchDocuments } = require("../../use_case/search_documents/SearchDocuments");

class SearchDocumentsController {
    async handle(queryParams) {
        const q = (queryParams.q || "").toString();
        const scope = (queryParams.scope || "all").toString();

        const usecase = new SearchDocuments();
        return await usecase.execute({ q, scope });
    }
}

module.exports = { SearchDocumentsController };
