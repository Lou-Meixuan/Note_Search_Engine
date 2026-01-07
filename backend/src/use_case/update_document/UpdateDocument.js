class UpdateDocument {
    constructor(documentRepository) {
        this.documentRepository = documentRepository;
    }

    async execute(documentId, updates) {
        if (!documentId) {
            throw new Error('Document ID is required');
        }

        const existingDocument = await this.documentRepository.findById(documentId);
        if (!existingDocument) {
            throw new Error('Document not found');
        }

        const allowedUpdates = {};

        if (updates.title !== undefined) {
            if (!updates.title || updates.title.trim().length === 0) {
                throw new Error('Title cannot be empty');
            }
            allowedUpdates.title = updates.title.trim();
        }

        if (updates.content !== undefined) {
            if (!updates.content || updates.content.trim().length === 0) {
                throw new Error('Content cannot be empty');
            }
            allowedUpdates.content = updates.content.trim();
        }

        if (updates.tags !== undefined) {
            allowedUpdates.tags = Array.isArray(updates.tags)
                ? updates.tags.filter(tag => tag && tag.trim().length > 0)
                : [];
        }

        allowedUpdates.updatedAt = new Date();

        console.log(`Updating document: ${documentId}`);

        const updatedDocument = await this.documentRepository.update(documentId, allowedUpdates);

        console.log(`Successfully updated document: ${documentId}`);

        return {
            success: true,
            documentId: updatedDocument.id,
            title: updatedDocument.title,
            updatedAt: updatedDocument.updatedAt
        };
    }
}

module.exports = UpdateDocument;
