class DocumentRepository {
    async save(document) {
        throw new Error('Method save() must be implemented');
    }
    async findById(id) {
        throw new Error('Method findById() must be implemented');
    }

    async findAll() {
        throw new Error('Method findAll() must be implemented');
    }

    async delete(id) {
        throw new Error('Method delete() must be implemented');
    }

    async findBySource(source) {
        throw new Error('Method findBySource() must be implemented');
    }
}

module.exports = DocumentRepository;