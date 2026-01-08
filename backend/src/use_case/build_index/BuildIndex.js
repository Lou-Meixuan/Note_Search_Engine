/**
 * BuildIndex.js - Build inverted index use case
 * 
 * Creates inverted index and document stats from all documents.
 */

const { InvertedIndex, PostingItem, DocStats } = require('../../entity/IndexTypes');
const { tokenizeFinal } = require('../../data_access/tokenizer/Tokens');

class BuildIndex {
    constructor(documentRepository, indexRepository) {
        this.documentRepository = documentRepository;
        this.indexRepository = indexRepository;
    }

    async execute() {
        console.log('Starting index build...');

        // 1. Clear old index
        await this.indexRepository.clearIndex();

        // 2. Get all documents
        const documents = await this.documentRepository.findAll();
        console.log(`Found ${documents.length} documents to index`);

        if (documents.length === 0) {
            return {
                success: true,
                message: 'No documents to index',
                indexedCount: 0,
                totalTerms: 0
            };
        }

        // 3. Initialize index and stats
        const invertedIndex = new InvertedIndex();
        const docStats = new DocStats();

        // 4. Tokenize and index each document
        for (const document of documents) {
            try {
                const stats = tokenizeFinal(document.content, {
                    mode: 'document',
                    output: 'stats'
                });

                // Add document stats for BM25 calculation
                docStats.addDoc(document.id, {
                    length: stats.length,
                    source: document.source,
                    title: document.title
                });

                // Build inverted index
                for (const [term, tf] of Object.entries(stats.tf)) {
                    const posting = new PostingItem({
                        docId: document.id,
                        tf: tf
                    });
                    invertedIndex.addPosting(term, posting);
                }

                console.log(`Indexed document: ${document.id} (${stats.uniqueTerms} unique terms)`);
            } catch (error) {
                console.error(`Error indexing document ${document.id}:`, error);
            }
        }

        // 5. Save index and stats
        await this.indexRepository.saveIndex(invertedIndex);
        await this.indexRepository.saveDocStats(docStats);

        const totalTerms = invertedIndex.getAllTerms().length;

        console.log(`Index build completed: ${documents.length} documents, ${totalTerms} unique terms`);

        return {
            success: true,
            message: 'Index built successfully',
            indexedCount: documents.length,
            totalTerms: totalTerms,
            avgDocLength: docStats.avgDocLength
        };
    }
}

module.exports = BuildIndex;
