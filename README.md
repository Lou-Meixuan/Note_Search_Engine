# Note_Search_Engine

本项目是一个结合 Google 搜索 与 GoodNotes 笔记管理理念的混合型搜索引擎系统，支持用户上传本地文件并搜索个人笔记，同时也可以搜索来自远程 URL 或其他用户共享的文档内容。

系统将本地上传文件与远程文档统一抽象为同一种文档模型，通过 tokenization（分词）、倒排索引（Inverted Index） 和 TF‑IDF / BM25 排序算法实现高效、可扩展的全文搜索。用户在搜索时可以自由选择仅搜索本地文件、仅搜索远程文档，或在全部数据源中进行联合搜索。

在架构设计上，本项目严格遵循 Clean Architecture 原则，将业务核心（搜索、索引、排名）与具体框架和技术实现（Express、文件系统、数据库）解耦，使系统具备良好的可维护性、可测试性和扩展性。未来可在不破坏核心逻辑的前提下，引入 语义搜索（Embedding）、权限控制、搜索推荐等高级功能。

## MVP
1. IngestLocalDocument
接收用户上传的本地文件，提取文本内容并存储为可索引的文档。

2. IngestRemoteDocument
从给定的 URL 或远程来源抓取内容，解析文本并存储为公共文档。

3. BuildIndex
对已有文档进行分词并构建倒排索引，用于后续高效搜索。

4. SearchDocuments
接收用户查询，对文档进行检索、排序，并返回搜索结果（支持 local / remote / all 过滤）。

5. GetDocument
根据文档 ID 获取文档的完整内容与元信息，用于详情页展示。

⭐ 推荐选做 Use Cases（产品感明显提升）
6. SearchByField
支持按指定字段（如标题或正文）进行搜索。

7. GenerateSnippet
根据查询词从文档中生成包含高亮关键词的摘要片段。

8. ReindexAll / RefreshIndex
在文档更新后重新构建索引，保证搜索结果最新。

🚀 加分 / 挑战型 Use Cases（时间允许再做）
9. SuggestQuery
当搜索结果较少或无结果时，给出拼写纠错或相似查询建议。

10. Autocomplete
在用户输入搜索词时提供实时联想补全建议。

11. ImportCorpus
批量导入文件夹或数据集中的文档并统一索引。

12. TrackSearchAnalytics
记录搜索行为与点击结果，用于分析热门查询或文档。

13. DeleteDocument
从系统中删除指定文档，并同步更新索引。

14. UpdateDocument
修改已有文档内容并触发索引更新。



