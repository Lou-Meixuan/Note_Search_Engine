/**
 * SearchDocuments 测试脚本
 * 
 * 运行方式:
 *   node src/use_case/search_documents/test_search.js           # BM25 only
 *   node src/use_case/search_documents/test_search.js --hybrid  # BM25 + Embedding
 */

"use strict";

const { SearchDocuments } = require("./SearchDocuments");

// Mock DocumentRepository
class MockDocumentRepository {
    constructor() {
        this.documents = [
            {
                id: "doc-1",
                title: "Machine Learning 入门教程",
                content: "机器学习是人工智能的一个分支。Machine learning uses algorithms to learn from data. 深度学习是机器学习的子领域。",
                source: "local",
                fileType: "pdf",
                createdAt: new Date("2024-01-01"),
            },
            {
                id: "doc-2",
                title: "React 前端开发指南",
                content: "React 是一个用于构建用户界面的 JavaScript 库。React uses a virtual DOM for efficient rendering. 组件化开发是 React 的核心思想。",
                source: "local",
                fileType: "md",
                createdAt: new Date("2024-01-02"),
            },
            {
                id: "doc-3",
                title: "Python 数据分析",
                content: "Python 是数据科学的首选语言。Pandas 和 NumPy 是常用的数据分析库。机器学习框架如 TensorFlow 和 PyTorch 都基于 Python。",
                source: "local",
                fileType: "txt",
                createdAt: new Date("2024-01-03"),
            },
            {
                id: "doc-4",
                title: "Deep Learning 深度学习笔记",
                content: "深度学习使用神经网络来学习数据的特征。CNN 用于图像识别，RNN 用于序列数据。Transformer 是目前最先进的架构。",
                source: "local",
                fileType: "pdf",
                createdAt: new Date("2024-01-04"),
            },
            {
                id: "doc-5",
                title: "Node.js 后端开发",
                content: "Node.js 是一个基于 Chrome V8 引擎的 JavaScript 运行时。Express 是最流行的 Node.js Web 框架。",
                source: "remote",
                fileType: "html",
                createdAt: new Date("2024-01-05"),
            },
        ];
    }

    async findAll() {
        return this.documents;
    }

    async findBySource(source) {
        return this.documents.filter(doc => doc.source === source);
    }
}

async function runTests(useEmbedding) {
    console.log("\n" + "=".repeat(60));
    console.log(`SearchDocuments Test (${useEmbedding ? "Hybrid: BM25 + Embedding" : "BM25 Only"})`);
    console.log("=".repeat(60) + "\n");

    const mockRepo = new MockDocumentRepository();
    console.log(`Loaded ${mockRepo.documents.length} mock documents\n`);

    const search = new SearchDocuments({
        documentRepository: mockRepo,
        alpha: 0.5,
        useEmbedding: useEmbedding,
    });

    const testCases = [
        { q: "machine learning", scope: "all" },
        { q: "机器学习", scope: "all" },
        { q: "React", scope: "local" },
        { q: "深度学习", scope: "all" },
        { q: "Python 数据", scope: "all" },
        { q: "前端开发", scope: "all" },
        { q: "人工智能入门", scope: "all" },  // 语义搜索测试
    ];

    for (const { q, scope } of testCases) {
        console.log("-".repeat(50));
        console.log(`Query: "${q}" | Scope: ${scope}`);
        console.log("-".repeat(50));

        try {
            const result = await search.execute({ q, scope });

            console.log(`Found: ${result.totalResults} results | Time: ${result.elapsed}\n`);

            if (result.results.length > 0) {
                result.results.slice(0, 3).forEach((r, i) => {
                    console.log(`  ${i + 1}. [${r.score}] ${r.title}`);
                    console.log(`     BM25: ${r.bm25Score} | Embedding: ${r.embeddingScore}`);
                });
            }
            console.log();
        } catch (error) {
            console.error(`Error: ${error.message}\n`);
        }
    }

    console.log("=".repeat(60));
    console.log("Test Complete!");
    console.log("=".repeat(60) + "\n");
}

// Main
const useEmbedding = process.argv.includes("--hybrid");
runTests(useEmbedding).catch(console.error);
