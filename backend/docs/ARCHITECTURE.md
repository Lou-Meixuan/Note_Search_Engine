# Backend Architecture

This backend follows **Clean Architecture** principles for maintainability and testability.

## Layer Structure

```
┌─────────────────────────────────────────────────────────────┐
│                  Frameworks & Drivers                        │
│   Express.js, MongoDB, External APIs                         │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              Interface Adapters                          ││
│  │   Controllers, Repositories                              ││
│  │  ┌─────────────────────────────────────────────────────┐││
│  │  │              Use Cases                               │││
│  │  │   Application Business Logic                         │││
│  │  │  ┌─────────────────────────────────────────────────┐│││
│  │  │  │              Entities                            ││││
│  │  │  │   Core Business Objects                          ││││
│  │  │  └─────────────────────────────────────────────────┘│││
│  │  └─────────────────────────────────────────────────────┘││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

**Dependency Rule**: Source code dependencies point inward only.

## Directory Structure

```
src/
├── app/                    # Express server and routes
│   ├── server.js           # Entry point
│   └── routes.js           # API endpoints
│
├── entity/                 # Core business entities
│   ├── Document.js         # Document model
│   ├── SearchResult.js     # Search result model
│   └── IndexTypes.js       # Index type definitions
│
├── use_case/               # Business logic
│   ├── ingest_local_document/
│   ├── search_documents/
│   ├── build_index/
│   ├── update_document/
│   └── delete_document/
│
├── interface_adapter/      # Controllers and repositories
│   ├── MongoDocumentRepository.js
│   ├── MongoIndexRepository.js
│   └── [feature]/Controller.js
│
└── data_access/            # External services
    ├── mongodb.js          # Database connection
    ├── FileParser.js       # File parsing (PDF, DOCX)
    ├── EmbeddingService.js # Text embeddings
    ├── GoogleSearchService.js
    └── tokenizer/          # Text tokenization
```

## Key APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/documents` | GET | List all documents |
| `/documents` | POST | Create document |
| `/documents/upload` | POST | Upload file |
| `/documents/:id` | GET | Get document |
| `/documents/:id` | PUT | Update document |
| `/documents/:id` | DELETE | Delete document |
| `/search` | GET | Search documents |
| `/tags` | GET | List all tags |

## Search Algorithm

The search system uses a **hybrid approach**:

1. **BM25**: Term frequency-based ranking for keyword matching
2. **Tag Filtering**: Filter by tags using `#tag` syntax
3. **User Scoping**: Documents filtered by userId when authenticated

## Data Flow Example

```
HTTP Request
    ↓
routes.js (parse request)
    ↓
Controller (validate, coordinate)
    ↓
Use Case (business logic)
    ↓
Repository (data access)
    ↓
MongoDB
```

