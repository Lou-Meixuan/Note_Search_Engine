const IngestLocalDocument = require('../../use_case/ingest_local_document/IngestLocalDocument');
const MongoDocumentRepository = require('../MongoDocumentRepository');

class IngestLocalDocumentController {
    async handle(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    error: 'No file uploaded'
                });
            }

            const metadata = {
                title: req.body.title || undefined,
                tags: req.body.tags ? req.body.tags.split(',').map(t => t.trim()) : [],
                userId: req.body.userId || null  // Firebase UID
            };

            const repository = new MongoDocumentRepository();
            const useCase = new IngestLocalDocument(repository);
            const result = await useCase.execute(req.file, metadata);

            return res.status(201).json(result);

        } catch (error) {
            console.error('Error in IngestLocalDocumentController:', error);
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}

module.exports = IngestLocalDocumentController;
