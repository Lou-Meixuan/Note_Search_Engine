/**
 * routes.js - API route definitions
 * 
 * Endpoints: /search, /documents, /tags
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

    // Status endpoint for debugging configuration
    app.get("/status", (req, res) => {
        res.json({
            server: "running",
            googleSearch: isGoogleConfigured() ? "configured" : "not configured",
            embedding: process.env.USE_EMBEDDING === 'true' ? "enabled" : "disabled",
            env: {
                hasGoogleApiKey: !!process.env.GOOGLE_API_KEY,
                hasGoogleSearchEngineId: !!process.env.GOOGLE_SEARCH_ENGINE_ID,
                hasMongoUri: !!process.env.MONGODB_URI,
            }
        });
    });

    app.get("/search", async (req, res) => {
        const q = (req.query.q || "").trim();
        const scope = (req.query.scope || "all").toLowerCase();
        const tagFilter = req.query.tag || null;
        const userId = req.query.userId || null;

        // Detect #tag syntax
        const tagMatch = q.match(/^#(\S+)$/);
        const isTagSearch = !!tagMatch;
        const searchTag = tagMatch ? tagMatch[1] : tagFilter;
        const actualQuery = isTagSearch ? "" : q;

        // Empty query without tag filter
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

            // Tag search - filter local documents by tag (only current user's documents)
            if (searchTag) {
                const MongoDocumentRepository = require("../interface_adapter/MongoDocumentRepository");
                const repository = new MongoDocumentRepository();
                
                // Only search current user's documents
                let userDocs = [];
                if (userId) {
                    userDocs = await repository.findByUserId(userId);
                }
                
                const taggedDocs = userDocs.filter(doc => 
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
                
                console.log(`[Search] Tag search "#${searchTag}" for user ${userId} found ${localResults.length} documents`);
            } 
            // Normal search
            else {
                // Local search (scope: "local" or "all")
                if (scope === "local" || scope === "all") {
                    const controller = new SearchDocumentsController();
                    const localSearchResult = await controller.handle({ 
                        q: actualQuery, 
                        scope: "local",
                        userId: userId  // Filter by current user
                    });
                    localResults = localSearchResult.results || [];
                    
                    // Add tags info to local results
                    const MongoDocumentRepository = require("../interface_adapter/MongoDocumentRepository");
                    const repository = new MongoDocumentRepository();
                    for (let result of localResults) {
                        const doc = await repository.findById(result.docId);
                        if (doc) {
                            result.tags = doc.tags || [];
                        }
                    }
                }

                // Remote search - Google API (scope: "remote" or "all")
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

    // Migrate documents from one user to another (used when guest links to account)
    app.post("/documents/migrate", async (req, res) => {
        try {
            const { fromUserId, toUserId } = req.body;
            
            if (!fromUserId || !toUserId) {
                return res.status(400).json({ error: "fromUserId and toUserId are required" });
            }

            const MongoDocumentRepository = require("../interface_adapter/MongoDocumentRepository");
            const repository = new MongoDocumentRepository();
            
            const count = await repository.migrateDocuments(fromUserId, toUserId);
            console.log(`[Migration] Migrated ${count} documents from ${fromUserId} to ${toUserId}`);
            
            res.json({ success: true, migratedCount: count });
        } catch (error) {
            console.error("[Migration] Error:", error);
            res.status(500).json({ error: error.message });
        }
    });

    // Cleanup endpoint for anonymous user documents (called via sendBeacon on page close)
    // Only deletes documents that have no userId (anonymous documents)
    app.post("/documents/:id/cleanup", async (req, res) => {
        try {
            const MongoDocumentRepository = require("../interface_adapter/MongoDocumentRepository");
            const repository = new MongoDocumentRepository();
            const document = await repository.findById(req.params.id);

            if (!document) {
                return res.status(404).json({ error: "Document not found" });
            }

            // Only delete if it's an anonymous document (no userId)
            if (document.userId) {
                return res.status(403).json({ error: "Cannot cleanup user-owned documents" });
            }

            await repository.delete(req.params.id);
            console.log(`[Cleanup] Deleted anonymous document: ${req.params.id}`);
            res.json({ success: true, deleted: req.params.id });
        } catch (error) {
            console.error("[Cleanup] Error:", error);
            res.status(500).json({ error: error.message });
        }
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
            
            const userId = req.query.userId;
            let documents;
            
            if (userId) {
                documents = await repository.findByUserId(userId);
            } else {
                documents = await repository.findAll();
            }
            
            res.json(documents);
        } catch (error) {
            console.error("Error fetching documents:", error);
            res.status(500).json({ error: error.message });
        }
    });

    // Get tags for a specific user
    app.get("/tags", async (req, res) => {
        try {
            const MongoDocumentRepository = require("../interface_adapter/MongoDocumentRepository");
            const repository = new MongoDocumentRepository();
            
            const userId = req.query.userId;
            let documents;
            
            // If userId provided, only get tags from that user's documents
            if (userId) {
                documents = await repository.findByUserId(userId);
            } else {
                // For anonymous users, return empty tags
                documents = [];
            }
            
            // Collect and count tags
            const tagCount = {};
            for (const doc of documents) {
                if (doc.tags && Array.isArray(doc.tags)) {
                    for (const tag of doc.tags) {
                        tagCount[tag] = (tagCount[tag] || 0) + 1;
                    }
                }
            }
            
            // Sort by count
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
