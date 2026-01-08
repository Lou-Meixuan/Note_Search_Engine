/**
 * Document.js - Document entity
 */

class Document {
    constructor({ id, title, content, fileType, fileName, source, tags, userId, createdAt, updatedAt, fileBuffer, mimeType }) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.fileType = fileType;
        this.fileName = fileName;
        this.source = source;
        this.tags = tags || [];
        this.userId = userId || null;
        this.createdAt = createdAt || new Date();
        this.updatedAt = updatedAt || new Date();
        this.fileBuffer = fileBuffer;
        this.mimeType = mimeType;
    }

    isValid() {
        return this.title?.trim().length > 0 && this.content?.trim().length > 0;
    }

    updateContent(newContent) {
        this.content = newContent;
        this.updatedAt = new Date();
    }

    addTag(tag) {
        if (tag && !this.tags.includes(tag)) {
            this.tags.push(tag);
            this.updatedAt = new Date();
        }
    }

    removeTag(tag) {
        const index = this.tags.indexOf(tag);
        if (index > -1) {
            this.tags.splice(index, 1);
            this.updatedAt = new Date();
        }
    }
}

module.exports = Document;
