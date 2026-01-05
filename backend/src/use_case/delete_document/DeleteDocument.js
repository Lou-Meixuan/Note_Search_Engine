class DeleteDocument {

    constructor(documentRepository) {
        this.documentRepository = documentRepository;
    }

    async execute(documentId) {

        if (!documentId) {
            throw new Error('Document ID is required');
        }

        const document = await this.documentRepository.findById(documentId);

        if (!document) {
            throw new Error(`Document with id ${documentId} not found`);
        }

        await this.documentRepository.delete(documentId);

        console.log(`Document deleted: ${documentId} (${document.title})`);

        return {
            success: true,
            documentId: documentId,
            deletedTitle: document.title
        };
    }
}

module.exports = DeleteDocument;