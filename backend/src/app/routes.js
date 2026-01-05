const { SearchDocumentsController } = require("../interface_adapter/search_documents/SearchDocumentsController");
const IngestLocalDocumentController = require("../interface_adapter/ingest_local_document/IngestLocalDocumentController");
const DeleteDocumentController = require("../interface_adapter/delete_document/DeleteDocumentController");
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
        const controller = new SearchDocumentsController();
        const result = await controller.handle(req.query);
        res.json(result);
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
