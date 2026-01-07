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

        // 空查询直接返回
        if (!q) {
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

            // 本地搜索 (scope: "local" 或 "all")
            if (scope === "local" || scope === "all") {
                const controller = new SearchDocumentsController();
                const localSearchResult = await controller.handle({ q, scope: "local" });
                localResults = localSearchResult.results || [];
            }

            // 远程搜索 - Google API (scope: "remote" 或 "all")
            if (scope === "remote" || scope === "all") {
                if (isGoogleConfigured()) {
                    try {
                        remoteResults = await searchGoogle(q, { num: 10 });
                    } catch (googleError) {
                        console.error("[Search] Google API error:", googleError.message);
                        // Google 搜索失败不影响本地结果
                    }
                } else {
                    console.warn("[Search] Google API not configured, skipping remote search");
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
            const documents = await repository.findAll();
            res.json(documents);
        } catch (error) {
            console.error("Error fetching documents:", error);
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
