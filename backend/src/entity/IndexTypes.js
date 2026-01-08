/**
 * IndexTypes.js - Inverted index data structures
 * 
 * PostingItem: Single entry in posting list (docId, term frequency, positions)
 * InvertedIndex: Maps terms to posting lists
 * DocStats: Document statistics for BM25 scoring
 */

class PostingItem {
    constructor({ docId, tf, positions = [] }) {
        this.docId = docId;
        this.tf = tf;
        this.positions = positions;
    }
}

class InvertedIndex {
    constructor() {
        this.index = {};
    }

    addPosting(term, posting) {
        if (!this.index[term]) {
            this.index[term] = [];
        }
        this.index[term].push(posting);
    }

    getPostingList(term) {
        return this.index[term] || [];
    }

    getAllTerms() {
        return Object.keys(this.index);
    }

    toJSON() {
        return this.index;
    }

    static fromJSON(json) {
        const instance = new InvertedIndex();
        instance.index = json;
        return instance;
    }
}

class DocStats {
    constructor() {
        this.totalDocs = 0;
        this.avgDocLength = 0;
        this.docs = {};
    }

    addDoc(docId, { length, source, title }) {
        this.docs[docId] = { length, source, title };
        this.totalDocs = Object.keys(this.docs).length;
        this._recalculateAvgLength();
    }

    _recalculateAvgLength() {
        const totalLength = Object.values(this.docs).reduce((sum, doc) => sum + doc.length, 0);
        this.avgDocLength = this.totalDocs > 0 ? totalLength / this.totalDocs : 0;
    }

    getDocInfo(docId) {
        return this.docs[docId] || null;
    }

    getDocIdsBySource(source) {
        if (source === "all") {
            return Object.keys(this.docs);
        }
        return Object.entries(this.docs)
            .filter(([_, info]) => info.source === source)
            .map(([docId]) => docId);
    }

    toJSON() {
        return {
            totalDocs: this.totalDocs,
            avgDocLength: this.avgDocLength,
            docs: this.docs
        };
    }

    static fromJSON(json) {
        const instance = new DocStats();
        instance.totalDocs = json.totalDocs;
        instance.avgDocLength = json.avgDocLength;
        instance.docs = json.docs;
        return instance;
    }
}

module.exports = { PostingItem, InvertedIndex, DocStats };
