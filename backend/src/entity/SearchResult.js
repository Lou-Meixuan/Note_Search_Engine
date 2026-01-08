/**
 * SearchResult.js - Search result entity
 */

class SearchResult {
    constructor({ docId, title, snippet, score, source }) {
        this.docId = docId;
        this.title = title;
        this.snippet = snippet;
        this.score = score;
        this.source = source;
    }

    toJSON() {
        return {
            docId: this.docId,
            title: this.title,
            snippet: this.snippet,
            score: this.score,
            source: this.source
        };
    }
}

module.exports = { SearchResult };
