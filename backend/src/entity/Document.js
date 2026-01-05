class Document {
    constructor({ id, title, content, fileType, fileName, source, tags, createdAt, updatedAt, fileBuffer, mimeType }) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.fileType = fileType;
        this.fileName = fileName;
        this.source = source;
        this.tags = tags || [];
        this.createdAt = createdAt || new Date();
        this.updatedAt = updatedAt || new Date();
        this.fileBuffer = fileBuffer; // 原始文件的二进制数据
        this.mimeType = mimeType; // MIME类型，如 'application/pdf'
    }

    isValid() {
        if (!this.title || this.title.trim().length === 0) {
            return false;
        }
        if (!this.content || this.content.trim().length === 0) {
            return false;
        }
        return true;
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
