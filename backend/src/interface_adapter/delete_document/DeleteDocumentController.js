const DeleteDocument = require('../../use_case/delete_document/DeleteDocument');
const MongoDocumentRepository = require('../MongoDocumentRepository');

class DeleteDocumentController {
    async handle(req, res) {
        try {
            const documentId = req.params.id;

            if (!documentId) {
                return res.status(400).json({
                    success: false,
                    error: 'Document ID is required'
                });
            }

            const repository = new MongoDocumentRepository();
            const useCase = new DeleteDocument(repository);
            const result = await useCase.execute(documentId);

            return res.status(200).json(result);

        } catch (error) {
            console.error('Error in DeleteDocumentController:', error);

            if (error.message.includes('not found')) {
                return res.status(404).json({
                    success: false,
                    error: error.message
                });
            }

            return res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}

module.exports = DeleteDocumentController;
