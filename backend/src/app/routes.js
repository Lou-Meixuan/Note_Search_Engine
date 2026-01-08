/**
 * routes.js - API 路由定义
 * 
 * Modified by: C
 * Date: 2026-01-07
 * 
 * 修改记录:
 * - C: 添加 Google Custom Search API 集成，支持 remote 搜索
 */

const { SearchDocumentsController } = require("../interface_adapter/search_documents/SearchDocumentsController");
const IngestLocalDocumentController = require("../interface_adapter/ingest_local_document/IngestLocalDocumentController");
const DeleteDocumentController = require("../interface_adapter/delete_document/DeleteDocumentController");
const UpdateDocumentController = require("../interface_adapter/update_document/UpdateDocumentController");
const { searchGoogle, isConfigured: isGoogleConfigured } = require("../data_access/GoogleSearchService");
const multer = require("multer");

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    }
});

function registerRoutes(app) {
    app.get("/health", (req, res) => res.send("ok"));

    app.get("/search", async (req, res) => {
        const q = (req.query.q || "").trim();
        const scope = (req.query.scope || "all").toLowerCase();
        const tagFilter = req.query.tag || null;  // 直接的 tag 筛选参数

        // 检测 #tag 语法: 提取 #xxx 作为 tag 搜索
        const tagMatch = q.match(/^#(\S+)$/);
        const isTagSearch = !!tagMatch;
        const searchTag = tagMatch ? tagMatch[1] : tagFilter;
        const actualQuery = isTagSearch ? "" : q;

        // 空查询且无 tag 筛选直接返回
        if (!actualQuery && !searchTag) {
            return res.json({
                query: q,
                scope,
                totalResults: 0,
                results: [],
            });
        }

        try {
            let localResults = [];
            let remoteResults = [];

            // Tag 搜索 - 直接按 tag 筛选本地文档
            if (searchTag) {
                const MongoDocumentRepository = require("../interface_adapter/MongoDocumentRepository");
                const repository = new MongoDocumentRepository();
                const allDocs = await repository.findAll();
                
                // 筛选包含该 tag 的文档
                const taggedDocs = allDocs.filter(doc => 
                    doc.tags && doc.tags.some(t => 
                        t.toLowerCase() === searchTag.toLowerCase()
                    )
                );
                
                localResults = taggedDocs.map(doc => ({
                    docId: doc.id,
                    title: doc.title,
                    snippet: doc.content ? doc.content.substring(0, 150) + "..." : "",
                    score: 1,
                    source: "local",
                    tags: doc.tags || [],
                }));
                
                console.log(`[Search] Tag search "#${searchTag}" found ${localResults.length} documents`);
            } 
            // 普通搜索
            else {
                // 本地搜索 (scope: "local" 或 "all")
                if (scope === "local" || scope === "all") {
                    const controller = new SearchDocumentsController();
                    const localSearchResult = await controller.handle({ q: actualQuery, scope: "local" });
                    localResults = localSearchResult.results || [];
                    
                    // 为本地结果添加 tags 信息
                    const MongoDocumentRepository = require("../interface_adapter/MongoDocumentRepository");
                    const repository = new MongoDocumentRepository();
                    for (let result of localResults) {
                        const doc = await repository.findById(result.docId);
                        if (doc) {
                            result.tags = doc.tags || [];
                        }
                    }
                }

                // 远程搜索 - Google API (scope: "remote" 或 "all")
                if (scope === "remote" || scope === "all") {
                    if (isGoogleConfigured()) {
                        try {
                            remoteResults = await searchGoogle(actualQuery, { num: 10 });
                        } catch (googleError) {
                            console.error("[Search] Google API error:", googleError.message);
                        }
                    } else {
                        console.warn("[Search] Google API not configured, skipping remote search");
                    }
                }
            }

            // 合并结果
            const allResults = [...remoteResults, ...localResults];

            res.json({
                query: q,
                scope,
                totalResults: allResults.length,
                results: allResults,
                localCount: localResults.length,
                remoteCount: remoteResults.length,
                isTagSearch,
                searchTag: searchTag || null,
            });

        } catch (error) {
            console.error("[Search] Error:", error);
            res.status(500).json({
                query: q,
                scope,
                totalResults: 0,
                results: [],
                error: error.message,
            });
        }
    });

    app.post("/documents/upload", upload.single("file"), async (req, res) => {
        const controller = new IngestLocalDocumentController();
        await controller.handle(req, res);
    });

    app.delete("/documents/:id", async (req, res) => {
        const controller = new DeleteDocumentController();
        await controller.handle(req, res);
    });

    app.put("/documents/:id", async (req, res) => {
        const controller = new UpdateDocumentController();
        await controller.handle(req, res);
    });

    app.get("/documents/:id", async (req, res) => {
        try {
            const MongoDocumentRepository = require("../interface_adapter/MongoDocumentRepository");
            const repository = new MongoDocumentRepository();
            const document = await repository.findById(req.params.id);

            if (!document) {
                return res.status(404).json({ error: "Document not found" });
            }

            res.json(document);
        } catch (error) {
            console.error("Error fetching document:", error);
            res.status(500).json({ error: error.message });
        }
    });

    app.get("/documents", async (req, res) => {
        try {
            const MongoDocumentRepository = require("../interface_adapter/MongoDocumentRepository");
            const repository = new MongoDocumentRepository();
            
            // 支持按 userId 筛选文档
            const userId = req.query.userId;
            let documents;
            
            if (userId) {
                // 获取该用户的文档
                documents = await repository.findByUserId(userId);
            } else {
                // 获取所有文档（未登录用户或无 userId 的文档）
                documents = await repository.findAll();
            }
            
            res.json(documents);
        } catch (error) {
            console.error("Error fetching documents:", error);
            res.status(500).json({ error: error.message });
        }
    });

    // 获取所有 tags
    app.get("/tags", async (req, res) => {
        try {
            const MongoDocumentRepository = require("../interface_adapter/MongoDocumentRepository");
            const repository = new MongoDocumentRepository();
            const documents = await repository.findAll();
            
            // 收集所有 tags 并统计数量
            const tagCount = {};
            for (const doc of documents) {
                if (doc.tags && Array.isArray(doc.tags)) {
                    for (const tag of doc.tags) {
                        tagCount[tag] = (tagCount[tag] || 0) + 1;
                    }
                }
            }
            
            // 转换为数组并按数量排序
            const tags = Object.entries(tagCount)
                .map(([name, count]) => ({ name, count }))
                .sort((a, b) => b.count - a.count);
            
            res.json({ tags, total: tags.length });
        } catch (error) {
            console.error("Error fetching tags:", error);
            res.status(500).json({ error: error.message });
        }
    });

    app.get("/documents/:id/file", async (req, res) => {
        try {
            const MongoDocumentRepository = require("../interface_adapter/MongoDocumentRepository");
            const repository = new MongoDocumentRepository();
            const document = await repository.findById(req.params.id);

            if (!document) {
                return res.status(404).json({ error: "Document not found" });
            }

            if (!document.fileBuffer || !document.mimeType) {
                return res.status(404).json({ error: "Original file not available" });
            }

            res.setHeader('Content-Type', document.mimeType);
            res.setHeader('Content-Disposition', `inline; filename="${document.fileName}"`);

            res.send(document.fileBuffer);
        } catch (error) {
            console.error("Error fetching file:", error);
            res.status(500).json({ error: error.message });
        }
    });
}

module.exports = { registerRoutes };
