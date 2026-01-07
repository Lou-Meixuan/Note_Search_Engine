const { InvertedIndex, PostingItem, DocStats } = require('../../entity/IndexTypes');
const { tokenizeFinal } = require('../../data_access/tokenizer/Tokens');

/**
 * BuildIndex Use Case
 *
 * 职责：构建倒排索引和文档统计信息
 *
 * 流程：
 * 1. 从DocumentRepository获取所有文档
 * 2. 对每个文档使用tokenizer进行分词
 * 3. 构建InvertedIndex（倒排索引）
 * 4. 构建DocStats（文档统计）
 * 5. 通过IndexRepository保存索引和统计
 */
class BuildIndex {
    constructor(documentRepository, indexRepository) {
        this.documentRepository = documentRepository;
        this.indexRepository = indexRepository;
    }

    async execute() {
        console.log('Starting index build...');

        // 1. 清空旧索引（重建索引前先清空）
        await this.indexRepository.clearIndex();

        // 2. 获取所有文档
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

        // 3. 初始化索引和统计对象
        const invertedIndex = new InvertedIndex();
        const docStats = new DocStats();

        // 4. 对每个文档进行分词并构建索引
        for (const document of documents) {
            try {
                // 使用tokenizer分词（document模式，输出stats包含tf词频）
                const stats = tokenizeFinal(document.content, {
                    mode: 'document',
                    output: 'stats'
                });

                // 添加文档统计信息（用于TF-IDF/BM25计算）
                docStats.addDoc(document.id, {
                    length: stats.length,        // 文档长度（分词后的词数）
                    source: document.source,     // 文档来源（local/remote）
                    title: document.title        // 文档标题
                });

                // 构建倒排索引：对每个词条添加posting
                // stats.tf 是一个对象：{ "term1": 3, "term2": 1, ... }
                for (const [term, tf] of Object.entries(stats.tf)) {
                    const posting = new PostingItem({
                        docId: document.id,
                        tf: tf  // term frequency（词频，该词在文档中出现的次数）
                    });
                    invertedIndex.addPosting(term, posting);
                }

                console.log(`Indexed document: ${document.id} (${stats.uniqueTerms} unique terms)`);
            } catch (error) {
                console.error(`Error indexing document ${document.id}:`, error);
                // 继续处理其他文档，不中断整个流程
            }
        }

        // 5. 保存索引和统计到Repository
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