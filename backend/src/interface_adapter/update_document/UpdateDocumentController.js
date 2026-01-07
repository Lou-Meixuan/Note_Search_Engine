const UpdateDocument = require('../../use_case/update_document/UpdateDocument');
const MongoDocumentRepository = require('../MongoDocumentRepository');

class UpdateDocumentController {
    async handle(req, res) {
        try {
            const { id } = req.params;
            const updates = {
                title: req.body.title,
                content: req.body.content,
                tags: req.body.tags
            };

            const repository = new MongoDocumentRepository();
            const useCase = new UpdateDocument(repository);
            const result = await useCase.execute(id, updates);

            return res.status(200).json(result);

        } catch (error) {
            console.error('Error in UpdateDocumentController:', error);

            if (error.message === 'Document not found') {
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

module.exports = UpdateDocumentController;
