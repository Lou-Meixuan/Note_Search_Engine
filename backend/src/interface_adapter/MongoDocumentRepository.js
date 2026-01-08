const DocumentRepository = require('./DocumentRepository');
const { DocumentModel } = require('../data_access/mongodb');
const Document = require('../entity/Document');

class MongoDocumentRepository extends DocumentRepository {

    async save(document) {

        const docData = {
            id: document.id,
            title: document.title,
            content: document.content,
            fileType: document.fileType,
            fileName: document.fileName,
            source: document.source,
            tags: document.tags,
            userId: document.userId || null,  // Firebase UID
            createdAt: document.createdAt,
            updatedAt: document.updatedAt,
            fileBuffer: document.fileBuffer,
            mimeType: document.mimeType
        };

        const documentModel = new DocumentModel(docData);
        await documentModel.save();

        console.log(`Saved to MongoDB: ${document.id} (userId: ${document.userId || 'anonymous'})`);

        return document;
    }

    async findById(id) {

        const doc = await DocumentModel.findOne({ id });

        if (!doc) {
            console.log(`Document not found: ${id}`);
            return null;
        }

        return new Document({
            id: doc.id,
            title: doc.title,
            content: doc.content,
            fileType: doc.fileType,
            fileName: doc.fileName,
            source: doc.source,
            tags: doc.tags,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
            fileBuffer: doc.fileBuffer,
            mimeType: doc.mimeType
        });
    }

    async findAll() {

        const docs = await DocumentModel.find({}).sort({ createdAt: -1 });

        console.log(`Found ${docs.length} documents in MongoDB`);

        return docs.map(doc => new Document({
            id: doc.id,
            title: doc.title,
            content: doc.content,
            fileType: doc.fileType,
            fileName: doc.fileName,
            source: doc.source,
            tags: doc.tags,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt
        }));
    }

    async delete(id) {

        const result = await DocumentModel.deleteOne({ id });

        if (result.deletedCount > 0) {
            console.log(`Deleted from MongoDB: ${id}`);
        } else {
            console.log(`Document not found for deletion: ${id}`);
        }
    }

    async findBySource(source) {

        const docs = await DocumentModel.find({ source }).sort({ createdAt: -1 });

        console.log(`Found ${docs.length} ${source} documents`);

        return docs.map(doc => new Document({
            id: doc.id,
            title: doc.title,
            content: doc.content,
            fileType: doc.fileType,
            fileName: doc.fileName,
            source: doc.source,
            tags: doc.tags,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt
        }));
    }

    async update(id, updates) {

        const doc = await DocumentModel.findOneAndUpdate(
            { id },
            { ...updates, updatedAt: new Date() },
            { new: true }
        );

        if (!doc) {
            console.log(`Document not found for update: ${id}`);
            return null;
        }

        console.log(`Updated in MongoDB: ${id}`);

        return new Document({
            id: doc.id,
            title: doc.title,
            content: doc.content,
            fileType: doc.fileType,
            fileName: doc.fileName,
            source: doc.source,
            tags: doc.tags,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt
        });
    }

    async count() {
        const count = await DocumentModel.countDocuments();
        console.log(`Total documents: ${count}`);
        return count;
    }

    /**
     * 按用户 ID 查找文档
     * @param {string} userId - Firebase UID
     * @returns {Promise<Document[]>} 该用户的所有文档
     */
    async findByUserId(userId) {
        const docs = await DocumentModel.find({ userId }).sort({ createdAt: -1 });
        
        console.log(`Found ${docs.length} documents for user: ${userId}`);
        
        return docs.map(doc => new Document({
            id: doc.id,
            title: doc.title,
            content: doc.content,
            fileType: doc.fileType,
            fileName: doc.fileName,
            source: doc.source,
            tags: doc.tags,
            userId: doc.userId,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt
        }));
    }
}

module.exports = MongoDocumentRepository;