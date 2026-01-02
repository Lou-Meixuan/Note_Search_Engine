class SearchDocuments {
    async execute({ q, scope }) {
        // Day1: mock 数据，先跑通链路
        return {
            query: q,
            scope,
            results: [
                { source: "local", docId: "local-1", title: "Local Note 1", snippet: "mock local result", score: 0.9 },
                { source: "remote", url: "https://example.com", title: "Remote Result", snippet: "mock remote result", score: 0.8 }
            ]
        };
    }
}

module.exports = { SearchDocuments };
