const Document = require('../../entity/Document');
const { v4: uuidv4 } = require('uuid');
const FileParser = require('../../data_access/FileParser');

class IngestLocalDocument {
    constructor(documentRepository, fileParser) {
        this.documentRepository = documentRepository;
        this.fileParser = new FileParser();
    }

    async execute(file, metadata = {}) {
        if (!file) {
            throw new Error('No file provided');
        }

        if (!this.fileParser.isSupportedType(file.originalname)) {
            throw new Error(
                `Unsupported file type. Supported types: txt, md, pdf, docx`
            );
        }

        console.log(`Ingesting local document: ${file.originalname}`);

        const content = await this.fileParser.extractText(file);

        if (!content || content.trim().length === 0) {
            throw new Error('No text content found in file');
        }

        const document = new Document({
            id: uuidv4(),
            title: metadata.title || this.generateTitle(file.originalname),
            content: content,
            fileType: this.fileParser.getFileType(file.originalname),
            fileName: file.originalname,
            source: 'local',
            tags: metadata.tags || [],
            createdAt: new Date(),
            updatedAt: new Date(),
            fileBuffer: file.buffer,
            mimeType: file.mimetype || this.getMimeType(file.originalname)
        });

        if (!document.isValid()) {
            throw new Error('Document validation failed');
        }

        await this.documentRepository.save(document);

        console.log(`Successfully ingested: ${document.id}`);

        return {
            success: true,
            documentId: document.id,
            title: document.title,
            fileType: document.fileType,
            contentLength: content.length
        };
    }

    generateTitle(fileName) {
        return fileName.replace(/\.[^/.]+$/, '');
    }

    getMimeType(fileName) {
        const ext = this.fileParser.getFileType(fileName);
        const mimeTypes = {
            'pdf': 'application/pdf',
            'txt': 'text/plain',
            'md': 'text/markdown',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        };
        return mimeTypes[ext] || 'application/octet-stream';
    }
}

module.exports = IngestLocalDocument;