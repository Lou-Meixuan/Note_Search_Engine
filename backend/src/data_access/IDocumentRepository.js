/**
 * IDocumentRepository - 文档存储接口（抽象基类）
 * 
 * 【设计模式：Repository Pattern】
 * Repository 模式将数据访问逻辑与业务逻辑分离。
 * 业务代码只依赖接口，不关心数据存在哪里（内存、文件、数据库）。
 * 
 * 使用者：
 * - M (IngestLocalDocument): 使用 save() 存储文档
 * - L (BuildIndex): 使用 findAll() 读取所有文档进行索引
 * - C (SearchDocuments): 使用 findById() 获取文档详情（可选）
 * 
 * ============================================================
 * 【Java 对照】
 * 
 * // Java 可以用 interface
 * public interface IDocumentRepository {
 *     void save(Document document);
 *     List<Document> findAll();
 *     Document findById(String id);
 * }
 * 
 * // 然后用 class 实现
 * public class InMemoryDocumentRepository implements IDocumentRepository {
 *     @Override
 *     public void save(Document document) { ... }
 * }
 * 
 * JavaScript 没有 interface 关键字，所以我们用抽象基类 + 抛异常来模拟。
 * ============================================================
 */
class IDocumentRepository {
    /**
     * 存储单个文档
     * 
     * 【使用者】M (IngestLocalDocument)
     * 
     * 【调用示例】
     * const doc = new Document({ id: "local-1", title: "My Note", ... });
     * await documentRepository.save(doc);
     * 
     * @param {Document} document - 文档实体
     * @returns {Promise<void>}
     * 
     * 【async/await 说明】
     * async 表示这是一个异步函数，返回 Promise
     * 调用时需要用 await 等待结果，或用 .then() 处理
     * 
     * 【Java 对照】类似于：
     * public CompletableFuture<Void> save(Document document) { ... }
     */
    async save(document) {
        // 【JavaScript 模拟抽象方法】
        // 子类必须重写这个方法，否则调用时会报错
        throw new Error("Method not implemented: save()");
    }

    /**
     * 获取所有文档
     * 
     * 【使用者】L (BuildIndex) - 需要读取所有文档来建索引
     * 
     * 【调用示例】
     * const allDocs = await documentRepository.findAll();
     * for (const doc of allDocs) {
     *     // 对每个文档建索引
     * }
     * 
     * @returns {Promise<Document[]>} 所有文档的数组
     */
    async findAll() {
        throw new Error("Method not implemented: findAll()");
    }

    /**
     * 根据来源获取文档
     * 
     * 【使用者】L (BuildIndex) - 可以按来源分别建索引
     * 
     * 【调用示例】
     * const localDocs = await documentRepository.findBySource("local");
     * 
     * @param {string} source - "local" | "remote"
     * @returns {Promise<Document[]>} 符合条件的文档数组
     */
    async findBySource(source) {
        throw new Error("Method not implemented: findBySource()");
    }

    /**
     * 根据 ID 获取单个文档
     * 
     * 【使用者】C (SearchDocuments) - 获取文档详情
     * 【使用者】GetDocument Use Case
     * 
     * 【调用示例】
     * const doc = await documentRepository.findById("local-123");
     * if (doc) {
     *     console.log(doc.title);
     * }
     * 
     * @param {string} id - 文档 ID
     * @returns {Promise<Document|null>} 文档实体，不存在则返回 null
     */
    async findById(id) {
        throw new Error("Method not implemented: findById()");
    }

    /**
     * 删除文档
     * 
     * 【使用者】未来扩展（DeleteDocument Use Case）
     * 
     * @param {string} id - 文档 ID
     * @returns {Promise<boolean>} 是否删除成功
     */
    async deleteById(id) {
        throw new Error("Method not implemented: deleteById()");
    }
}

module.exports = { IDocumentRepository };
