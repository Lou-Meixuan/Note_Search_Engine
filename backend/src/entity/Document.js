/**
 * Document 实体 - 三人共用
 * 
 * 使用者：
 * - M (IngestLocalDocument): 创建 Document 并存储
 * - L (BuildIndex): 读取 Document.content 进行分词
 * - C (SearchDocuments): 返回结果时使用 Document 信息
 * 
 * ============================================================
 * 【Java 对照】这个类在 Java 中类似于：
 * 
 * public class Document {
 *     private String id;
 *     private String title;
 *     private String content;
 *     private String source;
 *     private Date createdAt;
 *     private Map<String, Object> metadata;
 *     
 *     public Document(String id, String title, ...) { ... }
 *     public String getId() { return this.id; }
 *     // ... 其他 getters
 * }
 * ============================================================
 */
class Document {
    /**
     * 构造函数
     * 
     * 【Java 对照】
     * Java: public Document(String id, String title, String content, ...)
     * 
     * JavaScript 使用「解构参数」的好处：
     * - 不需要记住参数顺序
     * - 可以有默认值
     * - 调用时代码更可读
     * 
     * 调用方式：
     *   new Document({ id: "xxx", title: "My Note", content: "..." })
     * 而不是：
     *   new Document("xxx", "My Note", "...", "local", new Date(), {})
     * 
     * @param {Object} params - 参数对象（用花括号包裹）
     * @param {string} params.id - 唯一标识符 (如 "local-uuid-xxx")
     * @param {string} params.title - 文档标题 (通常是文件名)
     * @param {string} params.content - 文档正文内容
     * @param {string} params.source - 来源: "local" | "remote"
     * @param {Date} params.createdAt - 创建时间（可选，默认为当前时间）
     * @param {Object} [params.metadata] - 可选的额外元信息
     */
    constructor({ id, title, content, source, createdAt, metadata = {} }) {
        // 【Java 对照】相当于：
        //   this.id = id;
        //   this.title = title;
        //   ...
        // JavaScript 不需要先声明字段，直接赋值就创建了

        this.id = id;
        this.title = title;
        this.content = content;
        this.source = source;  // 只能是 "local" 或 "remote"

        // 【JavaScript 特性】|| 运算符用于提供默认值
        // 如果 createdAt 是 undefined/null，则使用 new Date()
        // Java 中需要用三元运算符：createdAt != null ? createdAt : new Date()
        this.createdAt = createdAt || new Date();

        // metadata 存储额外信息，如 { fileType: "pdf", fileSize: 1024 }
        this.metadata = metadata;
    }

    /**
     * 转换为普通对象（用于 JSON 序列化/存储）
     * 
     * 【Java 对照】类似于实现 Serializable 或写一个 toMap() 方法
     * 
     * @returns {Object} 普通 JavaScript 对象
     */
    toJSON() {
        // 【JavaScript 特性】对象字面量
        // 当 key 和 value 变量名相同时可以简写：
        //   { id: this.id } 可以写成 { id } 如果变量名就叫 id
        // 但这里我们用 this.xxx，所以要写完整
        return {
            id: this.id,
            title: this.title,
            content: this.content,
            source: this.source,
            createdAt: this.createdAt,
            metadata: this.metadata
        };
    }

    /**
     * 静态工厂方法：从普通对象创建 Document 实例
     * 
     * 【Java 对照】类似于：
     *   public static Document fromJSON(Map<String, Object> json) { ... }
     * 
     * @param {Object} json - 普通 JavaScript 对象
     * @returns {Document} Document 实例
     */
    static fromJSON(json) {
        // 【JavaScript 特性】展开运算符 ...
        // ...json 会把 json 对象的所有属性"展开"
        // 相当于 Java 中把 Map 的所有 entry 复制过来
        return new Document({
            ...json,  // 展开 json 的所有属性
            createdAt: new Date(json.createdAt)  // 覆盖 createdAt，转成 Date 对象
        });
    }
}

// 【Node.js 模块导出】
// 相当于 Java 的 public class（让其他文件可以 import）
// 
// 导出方式：module.exports = { 类名1, 类名2, ... }
// 导入方式：const { Document } = require("./Document");
// 
// 这里 { Document } 是 ES6 简写，等同于 { Document: Document }
module.exports = { Document };
