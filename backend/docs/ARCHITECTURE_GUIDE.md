# Architecture Design Guide & JavaScript Primer
# 架构设计指南 & JavaScript 入门

> For developers with Java/Python experience but new to JavaScript
> 面向有 Java/Python 经验、但没有 JavaScript 经验的开发者

---

## Table of Contents / 目录

1. [Clean Architecture Overview / Clean Architecture 概述](#1-clean-architecture-overview)
2. [Layer-by-Layer Explanation / 逐层解析](#2-layer-by-layer-explanation)
3. [Data Flow Example / 数据流示例](#3-data-flow-example)
4. [JavaScript vs Java Syntax / JavaScript vs Java 语法对照](#4-javascript-vs-java-syntax)
5. [Node.js Core Concepts / Node.js 核心概念](#5-nodejs-core-concepts)
6. [File Structure / 文件结构](#6-file-structure)
7. [Team Collaboration / 三人协作](#7-team-collaboration)

---

## 1. Clean Architecture Overview
## Clean Architecture 概述

### 1.1 The Concentric Circles / 同心圆结构

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Frameworks & Drivers (蓝色/最外层)                    │
│   Web, UI, Database, Devices, External Interfaces                       │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                Interface Adapters (绿色/第三层)                    │  │
│  │   Controllers, Gateways, Presenters                               │  │
│  │  ┌─────────────────────────────────────────────────────────────┐  │  │
│  │  │              Use Cases / Application Business Rules          │  │  │
│  │  │                      (粉色/第二层)                            │  │  │
│  │  │  ┌─────────────────────────────────────────────────────┐    │  │  │
│  │  │  │         Entities / Enterprise Business Rules         │    │  │  │
│  │  │  │                   (黄色/最内层)                       │    │  │  │
│  │  │  └─────────────────────────────────────────────────────┘    │  │  │
│  │  └─────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Dependency Rule / 依赖规则

**The Dependency Rule: Source code dependencies must point only inward.**
**依赖规则：源代码依赖只能指向内层。**

- Outer layers can depend on inner layers ✅
- Inner layers CANNOT depend on outer layers ❌

| Layer | Can Depend On | Cannot Depend On |
|-------|---------------|------------------|
| Frameworks & Drivers | All inner layers | - |
| Interface Adapters | Use Cases, Entities | Frameworks |
| Use Cases | Entities only | Interface Adapters, Frameworks |
| Entities | Nothing | Everything else |

---

## 2. Layer-by-Layer Explanation
## 逐层解析

### 2.1 Entities (Enterprise Business Rules) / 实体层

**Location / 位置**: `src/entity/`

**What it contains / 包含内容**:
- Pure data structures / 纯数据结构
- Business objects that are independent of any application / 与任何应用无关的业务对象

**Our files / 我们的文件**:
- `Document.js` - 文档实体
- `SearchResult.js` - 搜索结果实体
- `IndexTypes.js` - 索引相关数据结构 (InvertedIndex, PostingItem, DocStats)

```javascript
// Entity example - no dependencies on frameworks or use cases
// Entity 示例 - 不依赖任何框架或用例
class Document {
    constructor({ id, title, content, source }) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.source = source;
    }
}
```

---

### 2.2 Use Cases (Application Business Rules) / 用例层

**Location / 位置**: `src/use_case/`

**What it contains / 包含内容**:

| Component | Description (EN) | Description (CN) |
|-----------|------------------|------------------|
| **Use Case Interactor** | The actual implementation of business logic | 业务逻辑的具体实现 |
| **Input Boundary (Interface)** | Interface that defines what the Use Case accepts | 定义 Use Case 接受什么输入的接口 |
| **Output Boundary (Interface)** | Interface that defines what the Use Case outputs | 定义 Use Case 输出什么的接口 |
| **Input Data (DTO)** | Data structure passed into the Use Case | 传入 Use Case 的数据结构 |
| **Output Data (DTO)** | Data structure returned from the Use Case | Use Case 返回的数据结构 |
| **Data Access Interface** | Interface for accessing data (defined here, implemented in outer layer) | 数据访问接口（这里定义，外层实现） |

**Key Point / 关键点**:
> **Data Access Interface** is defined in the Use Case layer, but implemented in the Frameworks layer!
> **Data Access Interface** 在 Use Case 层定义，但在 Frameworks 层实现！

```
┌──────────────────────────────────────────────────────────────────┐
│                     Use Case Layer                               │
│                                                                  │
│   ┌─────────────┐     ┌────────────────────┐                    │
│   │ Input Data  │────▶│  Input Boundary    │◀─── (interface)    │
│   │   (DTO)     │     │    (Interface)     │                    │
│   └─────────────┘     └─────────┬──────────┘                    │
│                                 │                                │
│                                 │ implements                     │
│                                 ▼                                │
│                       ┌────────────────────┐                    │
│                       │  Use Case          │                    │
│                       │  Interactor        │──────┐             │
│                       │  (Concrete Class)  │      │             │
│                       └─────────┬──────────┘      │             │
│                                 │                 │ uses        │
│                                 │ implements      ▼             │
│                                 ▼          ┌─────────────────┐  │
│                       ┌────────────────┐   │ Data Access     │  │
│   ┌─────────────┐     │ Output Boundary│   │ Interface       │  │
│   │ Output Data │◀────│  (Interface)   │   │ (Interface)     │  │
│   │   (DTO)     │     └────────────────┘   └─────────────────┘  │
│   └─────────────┘                                  ▲            │
│                                                    │            │
└────────────────────────────────────────────────────┼────────────┘
                                                     │ implements
                                                     │
                            ┌────────────────────────┴─────────┐
                            │   Frameworks & Drivers Layer     │
                            │                                  │
                            │   ┌──────────────────────────┐   │
                            │   │  Data Access             │   │
                            │   │  (Concrete Class)        │   │
                            │   │  e.g., InMemoryRepo,     │   │
                            │   │       MySQLRepo          │   │
                            │   └──────────────────────────┘   │
                            │                                  │
                            └──────────────────────────────────┘
```

---

### 2.3 Interface Adapters / 接口适配器层

**Location / 位置**: `src/interface_adapter/`

**What it contains / 包含内容**:

| Component | Description (EN) | Description (CN) |
|-----------|------------------|------------------|
| **Controller** | Converts HTTP request into Use Case Input Data | 将 HTTP 请求转换为 Use Case 输入数据 |
| **Presenter** | Converts Use Case Output Data into View Model | 将 Use Case 输出数据转换为 View Model |
| **Gateway** | Implements Data Access Interface (optional location) | 实现 Data Access Interface（可选位置） |
| **View Model** | Data structure for the UI to display | UI 显示用的数据结构 |

**Flow of Control / 控制流**:

```
HTTP Request
     │
     ▼
┌─────────────┐     ┌────────────────────┐     ┌────────────────────┐
│ Controller  │────▶│ Use Case Input     │────▶│ Use Case           │
│             │     │ Port (Boundary)    │     │ Interactor         │
└─────────────┘     └────────────────────┘     └──────────┬─────────┘
                                                          │
                                                          ▼
┌─────────────┐     ┌────────────────────┐     ┌────────────────────┐
│ View Model  │◀────│ Presenter          │◀────│ Use Case Output    │
│             │     │                    │     │ Port (Boundary)    │
└─────────────┘     └────────────────────┘     └────────────────────┘
     │
     ▼
HTTP Response (JSON)
```

---

### 2.4 Frameworks & Drivers / 框架与驱动层

**Location / 位置**: `src/app/`, `src/data_access/` (implementations)

**What it contains / 包含内容**:

| Component | Description (EN) | Description (CN) |
|-----------|------------------|------------------|
| **Web Framework** | Express.js routes, server setup | Express.js 路由、服务器配置 |
| **Database** | MySQL, MongoDB, or even in-memory storage | MySQL、MongoDB 或内存存储 |
| **External Services** | Google Search API, file system | Google 搜索 API、文件系统 |
| **Data Access Implementation** | Concrete classes that implement Data Access Interface | 实现 Data Access Interface 的具体类 |

---

## 3. Data Flow Example
## 数据流示例

### SearchDocuments Use Case / SearchDocuments 用例

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              User types "machine learning"                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ [Frameworks & Drivers - 蓝色]                                               │
│                                                                             │
│   Express.js receives: GET /search?q=machine+learning&scope=local           │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ [Interface Adapters - 绿色]                                                  │
│                                                                             │
│   Controller: SearchDocumentsController                                     │
│   - Extracts query params: { q: "machine learning", scope: "local" }        │
│   - Creates Input Data (DTO): SearchInput                                   │
│   - Calls Use Case through Input Boundary                                   │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ [Use Cases - 粉色]                                                           │
│                                                                             │
│   Use Case Interactor: SearchDocuments                                      │
│   1. Tokenize query: ["machine", "learning"]                                │
│   2. Call IndexRepository.getPostingList("machine")  ← Data Access Interface│
│   3. Call IndexRepository.getPostingList("learning") ← Data Access Interface│
│   4. Merge results, calculate TF-IDF/BM25 scores                            │
│   5. Filter by scope (local only)                                           │
│   6. Sort by score, return Output Data                                      │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                  ┌─────────────────────┴─────────────────────┐
                  ▼                                           ▼
┌─────────────────────────────────┐   ┌───────────────────────────────────────┐
│ [Entities - 黄色]                │   │ [Frameworks - 蓝色]                   │
│                                 │   │                                       │
│ - InvertedIndex.getPostingList()│   │  IndexRepository Implementation       │
│ - DocStats.getDocIdsBySource()  │   │  (e.g., InMemoryIndexRepository)      │
│ - SearchResult (create new)     │   │                                       │
└─────────────────────────────────┘   └───────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ [Interface Adapters - 绿色]                                                  │
│                                                                             │
│   Presenter: (optional, can be in Controller)                               │
│   - Converts SearchResult[] to JSON-friendly format                         │
│   - Creates View Model                                                      │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ [Frameworks & Drivers - 蓝色]                                               │
│                                                                             │
│   Express.js sends JSON response:                                           │
│   {                                                                         │
│     "query": "machine learning",                                            │
│     "results": [                                                            │
│       { "docId": "local-1", "title": "ML Notes", "score": 0.95 },           │
│       { "docId": "local-2", "title": "AI Intro", "score": 0.82 }            │
│     ]                                                                       │
│   }                                                                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. JavaScript vs Java Syntax
## JavaScript vs Java 语法对照

### 4.1 Variable Declaration / 变量声明

```java
// Java
String name = "Alice";
final int age = 25;           // constant
List<String> items = new ArrayList<>();
```

```javascript
// JavaScript
let name = "Alice";           // let: mutable variable (类似 Java 普通变量)
const age = 25;               // const: constant (类似 Java final)
// Don't use 'var' - it has scoping issues / 不要用 var，有作用域问题

// JavaScript is dynamically typed - no type declarations needed
// JavaScript 是动态类型 - 不需要类型声明
let items = [];               // empty array (空数组)
let user = { name: "Bob" };   // object (对象)
```

### 4.2 Functions / 函数

```java
// Java
public String greet(String name) {
    return "Hello, " + name;
}
```

```javascript
// JavaScript - Method 1: Regular function / 普通函数
function greet(name) {
    return "Hello, " + name;
}

// JavaScript - Method 2: Arrow function (like Java Lambda) / 箭头函数
const greet = (name) => {
    return "Hello, " + name;
};

// JavaScript - Method 3: Arrow function shorthand / 箭头函数简写
const greet = (name) => "Hello, " + name;

// JavaScript - Template literals (like Java 15+ Text Blocks) / 模板字符串
const greet = (name) => `Hello, ${name}`;  // Use backticks ` and ${variable}
```

### 4.3 Classes / 类

```java
// Java
public class Document {
    private String id;
    private String title;
    
    public Document(String id, String title) {
        this.id = id;
        this.title = title;
    }
    
    public String getId() {
        return this.id;
    }
}
```

```javascript
// JavaScript
class Document {
    // No explicit field declarations in JavaScript
    // JavaScript 没有显式的字段声明
    // Fields are created by assigning to this.xxx in constructor
    // 字段通过在构造函数中赋值 this.xxx 来创建
    
    constructor(id, title) {
        this.id = id;       // Creates 'id' field / 创建 id 字段
        this.title = title;
    }
    
    // Methods don't need public/private keywords
    // 方法不需要 public/private 关键字
    getId() {
        return this.id;
    }
    
    // Static method / 静态方法
    static create(id, title) {
        return new Document(id, title);
    }
}
```

### 4.4 Object Destructuring (JavaScript特有!) / 对象解构

```java
// Java - Extract values from object
User user = new User("Alice", 25);
String name = user.getName();
int age = user.getAge();
```

```javascript
// JavaScript - Destructuring assignment / 解构赋值
const user = { name: "Alice", age: 25, city: "NYC" };

// Traditional way / 传统方式
const name = user.name;
const age = user.age;

// Destructuring (recommended!) / 解构（推荐！）
const { name, age } = user;  // One line! / 一行搞定！

// Function parameter destructuring (we use this A LOT)
// 函数参数解构（我们大量使用这个）
function greet({ name, age }) {
    console.log(`${name} is ${age} years old`);
}
greet(user);  // Pass entire object, auto-destructure inside
              // 传入整个对象，函数内部自动解构
```

### 4.5 Async/Await (CRITICAL!) / 异步编程（非常重要！）

```java
// Java - Synchronous / 同步代码
String content = readFile("doc.txt");  // Blocks and waits / 阻塞等待
System.out.println(content);
```

```javascript
// JavaScript - Asynchronous / 异步代码

// Method 1: Promise (like Java CompletableFuture)
readFile("doc.txt")
    .then(content => console.log(content))
    .catch(error => console.error(error));

// Method 2: async/await (RECOMMENDED! Looks like sync code)
// async/await（推荐！看起来像同步代码）
async function main() {
    try {
        const content = await readFile("doc.txt");  // 'await' waits for result
        console.log(content);
    } catch (error) {
        console.error(error);
    }
}

// RULES / 规则:
// 1. 'await' can only be used inside 'async' functions
//    'await' 只能在 'async' 函数内使用
// 2. 'await' expects a Promise (or async function call)
//    'await' 后面必须是 Promise（或 async 函数调用）
// 3. 'async' functions automatically return a Promise
//    'async' 函数自动返回 Promise
```

### 4.6 Module Import/Export / 模块导入导出

```java
// Java
import com.example.entity.Document;
```

```javascript
// JavaScript (CommonJS - Node.js default)

// Export - Method 1: Single export / 单个导出
module.exports = Document;

// Export - Method 2: Multiple exports (we use this) / 多个导出（我们用这个）
module.exports = { Document, SearchResult };

// Import / 导入
const { Document } = require("./entity/Document");
const { Document, SearchResult } = require("./entity");  // Destructure multiple
```

### 4.7 Array Methods / 数组方法

```java
// Java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);
List<Integer> doubled = numbers.stream()
    .map(n -> n * 2)
    .filter(n -> n > 4)
    .collect(Collectors.toList());
```

```javascript
// JavaScript - Chain methods (very similar to Java Stream!)
// JavaScript - 链式调用（和 Java Stream 很像！）
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers
    .map(n => n * 2)       // [2, 4, 6, 8, 10]
    .filter(n => n > 4);   // [6, 8, 10]

// Common array methods / 常用数组方法:
arr.push(item);           // Add element (like list.add())
arr.forEach(fn);          // Iterate (like list.forEach())
arr.find(fn);             // Find first match (like stream.findFirst())
arr.reduce(fn, init);     // Reduce (like stream.reduce())
arr.includes(item);       // Contains check (like list.contains())
```

### 4.8 Object as HashMap / 对象当作 HashMap 用

```javascript
// JavaScript objects work like HashMap!
// JavaScript 对象就是 HashMap！
const map = {};
map["key1"] = "value1";           // Add / 添加
map.key2 = "value2";              // Another way to add / 另一种写法
console.log(map["key1"]);         // Read / 读取
console.log(map.key2);            // Another way to read / 另一种读取方式

// Iteration / 遍历
Object.keys(map);                 // ["key1", "key2"] - all keys
Object.values(map);               // ["value1", "value2"] - all values
Object.entries(map);              // [["key1","value1"], ["key2","value2"]] - key-value pairs

// Loop / 循环
for (const [key, value] of Object.entries(map)) {
    console.log(key, value);
}
```

---

## 5. Node.js Core Concepts
## Node.js 核心概念

### 5.1 What is Node.js? / Node.js 是什么？

| Concept | Java | JavaScript |
|---------|------|------------|
| Runtime | JVM (Java Virtual Machine) | Node.js |
| Execute | `javac Main.java && java Main` | `node main.js` |
| Package Manager | Maven / Gradle | npm |
| Config File | `pom.xml` / `build.gradle` | `package.json` |

### 5.2 npm Commands / npm 命令

```bash
# Install dependencies (like 'mvn install')
# 安装依赖（类似 mvn install）
npm install

# Add new dependency (like adding to pom.xml)
# 添加新依赖（类似在 pom.xml 添加 dependency）
npm install express

# Run script (like 'mvn exec:java')
# 运行脚本（类似 mvn exec:java）
npm run start
```

### 5.3 package.json (like pom.xml)

```json
{
  "name": "note-search-engine",
  "version": "1.0.0",
  "scripts": {
    "start": "node src/app/server.js",
    "dev": "nodemon src/app/server.js"
  },
  "dependencies": {
    "express": "^4.18.0"
  }
}
```

---

## 6. File Structure
## 文件结构

```
backend/src/
│
├── entity/                          # [Entities - 黄色] Enterprise Business Rules
│   ├── Document.js                  # 文档实体
│   ├── SearchResult.js              # 搜索结果实体
│   └── IndexTypes.js                # InvertedIndex, PostingItem, DocStats
│
├── use_case/                        # [Use Cases - 粉色] Application Business Rules
│   ├── search_documents/
│   │   ├── SearchDocuments.js       # Use Case Interactor
│   │   ├── SearchInput.js           # Input Data (DTO) - optional
│   │   └── SearchOutput.js          # Output Data (DTO) - optional
│   ├── build_index/
│   │   └── BuildIndex.js            # Use Case Interactor
│   └── ingest_local_document/
│       └── IngestLocalDocument.js   # Use Case Interactor
│
├── interface_adapter/               # [Interface Adapters - 绿色]
│   └── search_documents/
│       └── SearchDocumentsController.js  # Controller
│
├── data_access/                     # Data Access Interfaces + Implementations
│   ├── IDocumentRepository.js       # Interface (defined in Use Case layer conceptually)
│   ├── IIndexRepository.js          # Interface
│   ├── InMemoryDocumentRepository.js  # Implementation [Frameworks - 蓝色]
│   └── InMemoryIndexRepository.js     # Implementation [Frameworks - 蓝色]
│
└── app/                             # [Frameworks & Drivers - 蓝色]
    ├── server.js                    # Express.js server setup
    └── routes.js                    # HTTP routes
```

---

## 7. Team Collaboration
## 三人协作

### 7.1 Responsibilities / 职责分工

| Person | Use Case | Interacts With |
|--------|----------|----------------|
| **M** | IngestLocalDocument | `Document` entity, `IDocumentRepository.save()` |
| **L** | BuildIndex | `IDocumentRepository.findAll()`, `IIndexRepository.saveIndex()`, `InvertedIndex`, `DocStats` |
| **C** | SearchDocuments | `IIndexRepository.getIndex()`, `InvertedIndex`, `DocStats`, `SearchResult` |

### 7.2 Shared Interfaces / 共享接口

**All three must agree on / 三人必须统一**:

1. **Document entity fields / Document 实体字段**
   ```javascript
   { id, title, content, source, createdAt, metadata }
   ```

2. **InvertedIndex structure / 倒排索引结构**
   ```javascript
   {
     "term": [{ docId, tf, positions }, ...]
   }
   ```

3. **DocStats structure / 文档统计结构**
   ```javascript
   { totalDocs, avgDocLength, docs: { docId: { length, source, title } } }
   ```

4. **Tokenizer / 分词器** - L and C MUST use the same tokenizer!
   L 和 C 必须使用同样的分词器！

### 7.3 Development Order / 开发顺序

```
Phase 1: Parallel Development (can work simultaneously)
阶段1：并行开发（可同时进行）
├── M: IngestLocalDocument (write documents)
├── L: BuildIndex (build index)
└── C: SearchDocuments (search documents)

Phase 2: Integration (integrate and test)
阶段2：联调
└── M uploads → L indexes → C searches
```

### 7.4 Mock Data for Independent Development / 独立开发用的 Mock 数据

**C (SearchDocuments) can use mock index / C 可以用 Mock 索引**:
```javascript
const mockIndex = new InvertedIndex();
mockIndex.addPosting("machine", new PostingItem({ docId: "doc-1", tf: 3 }));
mockIndex.addPosting("learning", new PostingItem({ docId: "doc-1", tf: 2 }));
```

**L (BuildIndex) can use mock documents / L 可以用 Mock 文档**:
```javascript
const mockDocs = [
    new Document({ id: "doc-1", title: "ML Notes", content: "machine learning is great", source: "local" }),
    new Document({ id: "doc-2", title: "DL Notes", content: "deep learning uses neural networks", source: "local" })
];
```

---

## Quick Reference Card / 快速参考卡片

```
┌─────────────────────────────────────────────────────────────┐
│                 JavaScript Quick Reference                  │
│                   JavaScript 速查                           │
├─────────────────────────────────────────────────────────────┤
│ Variables    let x = 1;  const y = 2;  (don't use var)     │
│ 变量                                    (不要用 var)        │
│                                                             │
│ Functions    const fn = (a, b) => a + b;                   │
│ 函数                                                        │
│                                                             │
│ Classes      class X { constructor() {} method() {} }      │
│ 类                                                          │
│                                                             │
│ Destructure  const { a, b } = obj;                         │
│ 解构                                                        │
│                                                             │
│ Template     `Hello ${name}`                               │
│ 模板字符串                                                   │
│                                                             │
│ Async        async function() { await promise; }           │
│ 异步                                                        │
│                                                             │
│ Export       module.exports = { A, B };                    │
│ 导出                                                        │
│                                                             │
│ Import       const { A } = require("./path");              │
│ 导入                                                        │
│                                                             │
│ Array        arr.map().filter().reduce()                   │
│ 数组                                                        │
│                                                             │
│ Object       Object.keys/values/entries(obj)               │
│ 对象                                                        │
└─────────────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────────┐
│               Clean Architecture Layers                     │
│               Clean Architecture 层级                       │
├─────────────────────────────────────────────────────────────┤
│ 🟡 Entities           Pure data, no dependencies           │
│    实体层             纯数据，无依赖                          │
│                                                             │
│ 🔴 Use Cases          Business logic, defines interfaces   │
│    用例层             业务逻辑，定义接口                      │
│                                                             │
│ 🟢 Interface Adapters Controllers, Presenters, Gateways    │
│    接口适配器层        控制器、展示器、网关                   │
│                                                             │
│ 🔵 Frameworks         Express, Database, External APIs     │
│    框架层             Express、数据库、外部 API              │
└─────────────────────────────────────────────────────────────┘
```
