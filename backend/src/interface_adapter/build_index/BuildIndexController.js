/**
 * BuildIndexController.js - HTTP handler for index building
 */

const BuildIndex = require('../../use_case/build_index/BuildIndex');
const MongoDocumentRepository = require('../MongoDocumentRepository');
const MongoIndexRepository = require('../MongoIndexRepository');
 */
class BuildIndexController {
    async handle(req, res) {
        try {
            // Create repository instances
            const documentRepository = new MongoDocumentRepository();
            const indexRepository = new MongoIndexRepository();

            // Create use case instance
            const buildIndexUseCase = new BuildIndex(documentRepository, indexRepository);

            // Execute index build
            const result = await buildIndexUseCase.execute();

            return res.status(200).json(result);

        } catch (error) {
            console.error('Error in BuildIndexController:', error);
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}

module.exports = BuildIndexController;
