# Note_Search_Engine

## 项目简介（Description）

本项目是一个结合 **Google 搜索** 与 **GoodNotes 笔记管理**理念的混合型搜索引擎系统，支持用户上传本地文件并搜索个人笔记，同时也可以搜索来自远程 URL 或其他用户共享的文档内容。

系统将**本地上传文件**与**远程文档**统一抽象为同一种文档模型，通过
**Tokenization（分词）**、**倒排索引（Inverted Index）** 以及
**TF‑IDF / BM25 排序算法**
实现高效、可扩展的全文搜索。

用户在搜索时可以自由选择：

- 仅搜索本地文件（Local）
- 仅搜索远程文档（Remote）
- 在全部数据源中进行联合搜索（All）

在架构设计上，本项目严格遵循 **Clean Architecture** 原则，将业务核心（搜索、索引、排名）与具体框架和技术实现（Express、文件系统、数据库）解耦，使系统具备良好的可维护性、可测试性和扩展性。未来可在不破坏核心逻辑的前提下，引入 **语义搜索（Embedding）**、权限控制、搜索推荐等高级功能。

---

## 系统核心功能（Use Cases）

### ✅ MVP（必须完成）

1. **IngestLocalDocument**
   接收用户上传的本地文件，提取文本内容并存储为可索引的文档。
2. **IngestRemoteDocument**
   从给定的 URL 或远程来源抓取内容，解析文本并存储为公共文档。
3. **BuildIndex**
   对已有文档进行分词并构建倒排索引，用于后续高效搜索。
4. **SearchDocuments**
   接收用户查询，对文档进行检索、排序，并返回搜索结果
   （支持 `local / remote / all` 过滤）。
5. **GetDocument**
   根据文档 ID 获取文档的完整内容与元信息，用于详情页展示。

---

### ⭐ 推荐选做 Use Cases（提升产品完成度）

6. **SearchByField**
   支持按指定字段（如标题或正文）进行搜索。
7. **GenerateSnippet**
   根据查询词从文档中生成包含高亮关键词的摘要片段。
8. **ReindexAll / RefreshIndex**
   在文档更新后重新构建索引，保证搜索结果的实时性。

---

### 🚀 加分 / 挑战型 Use Cases（时间允许再实现）

9. **SuggestQuery**
   当搜索结果较少或无结果时，给出拼写纠错或相似查询建议。
10. **Autocomplete**
    在用户输入搜索词时提供实时联想补全建议。
11. **ImportCorpus**
    批量导入文件夹或数据集中的文档并统一索引。
12. **TrackSearchAnalytics**
    记录搜索行为与点击结果，用于分析热门查询或文档。
13. **DeleteDocument**
    从系统中删除指定文档，并同步更新索引。
14. **UpdateDocument**
    修改已有文档内容并触发索引更新。

---

## Q & A（可实施性说明）

### Q1：如何像 Google 一样搜索大量网站？

**方案 A（推荐）：垂直搜索（Vertical Search）**

- 只爬取并索引一批允许/选择的网站（如课程资料站、新闻站、博客等）
- 从一组 seed URLs 开始
- 流程：抓取 HTML → 提取正文 → tokenize → 建立倒排索引
- 规模可控，适合课程项目和 Demo

**方案 B：接入 Google 搜索 API**

- 使用 Google Programmable Search / Custom Search JSON API
- 优点：效果最接近 Google，集成快
- 缺点：更像“调用外部搜索”，自身索引与排序作用较弱
- 费用：每天 100 次免费，超出后约 \$5 / 1000 次

**方案 C：使用 Common Crawl 公共网页语料**

- 优点：数据量大，覆盖网站多
- 缺点：工程复杂度高，不适合短周期完整实现（可选子集）


---

### Q2：如何“像 terminal 一样列出桌面文件”？

在 **Web 应用（Website）** 中，无法直接访问用户的桌面或磁盘路径。

**可行方案：用户授权选择文件/文件夹**

- 用户点击按钮
- 浏览器弹出系统窗口
- 用户手动选择桌面文件夹或任意文件夹
- 系统仅能访问**被授权范围内的文件内容**
- 无法获取真实的绝对路径（出于浏览器安全限制）

该方式符合浏览器安全模型，适合本项目的“本地文档搜索”需求。

---

## 技术栈（Tech Stack）

- **前端**

  - HTML / CSS / JavaScript
  - React
- **后端**

  - Node.js（Express）
  - （可选）Java
- **数据库**

  - MySQL / PostgreSQL / MongoDB（根据实现选择）
- **搜索技术**

  - Tokenization
  - Inverted Index
  - TF‑IDF / BM25
- **架构**

  - Clean Architecture

---

## 项目目标总结

- 理解并实现搜索引擎的核心机制（索引、检索、排序）
- 将搜索系统应用到真实场景（本地笔记 + 远程文档）
- 通过 Clean Architecture 提升系统的可维护性与扩展性


目前定下的信息：

* 形态：**Website（未来可扩展成 App）**
* 技术栈：**JavaScript + React + Node.js**
* Remote：**方案 B：接入 Google 搜索 API**
* Local：**用户授权选择文件/文件夹（File Picker）**
* 架构：**Clean Architecture**
