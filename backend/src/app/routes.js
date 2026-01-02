const { SearchDocumentsController } = require("../interface_adapter/search_documents/SearchDocumentsController");

function registerRoutes(app) {
    app.get("/health", (req, res) => res.send("ok"));

    app.get("/search", async (req, res) => {
        const controller = new SearchDocumentsController();
        const result = await controller.handle(req.query);
        res.json(result);
    });
}

module.exports = { registerRoutes };
