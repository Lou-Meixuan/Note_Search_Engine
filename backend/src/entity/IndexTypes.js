/**
 * 索引相关的数据结构定义 - L 和 C 共用
 * 
 * 使用者：
 * - L (BuildIndex): 构建这些数据结构
 * - C (SearchDocuments): 读取并使用这些数据结构进行搜索
 * 
 * ============================================================
 * 【背景知识：什么是倒排索引？】
 * 
 * 正排索引（Forward Index）：文档 -> 词
 *   doc1: ["machine", "learning", "is", "great"]
 *   doc2: ["deep", "learning", "uses", "neural"]
 * 
 * 倒排索引（Inverted Index）：词 -> 文档列表
 *   "machine":  [doc1]
 *   "learning": [doc1, doc2]   <- learning 出现在两个文档中
 *   "deep":     [doc2]
 * 
 * 搜索时，用户输入 "learning"，直接从倒排索引找到 [doc1, doc2]，
 * 不需要遍历所有文档，所以搜索速度极快！
 * ============================================================
 */

/**
 * PostingItem - 倒排列表中的单个条目
 * 
 * 【Java 对照】
 * public class PostingItem {
 *     private String docId;
 *     private int tf;  // Term Frequency 词频
 *     private List<Integer> positions;
 * }
 * 
 * 示例：
 *   { docId: "local-1", tf: 3, positions: [10, 25, 100] }
 *   表示：词在文档 local-1 中出现了 3 次，位置分别是第 10、25、100 个词
 */
class PostingItem {
    /**
     * @param {Object} params
     * @param {string} params.docId - 文档 ID
     * @param {number} params.tf - 词频 (Term Frequency)，该词在文档中出现的次数
     * @param {number[]} [params.positions] - 词在文档中的位置列表（可选，用于短语搜索）
     */
    constructor({ docId, tf, positions = [] }) {
        this.docId = docId;
        this.tf = tf;
        this.positions = positions;  // 默认值是空数组 []
    }
}

/**
 * InvertedIndex - 倒排索引
 * 
 * 【数据结构】
 * {
 *   "machine": [
 *     { docId: "local-1", tf: 3, positions: [10, 25, 100] },
 *     { docId: "local-2", tf: 1, positions: [50] }
 *   ],
 *   "learning": [
 *     { docId: "local-1", tf: 2, positions: [11, 26] }
 *   ]
 * }
 * 
 * 【Java 对照】
 * public class InvertedIndex {
 *     // 本质就是一个 Map<String, List<PostingItem>>
 *     private Map<String, List<PostingItem>> index = new HashMap<>();
 *     
 *     public void addPosting(String term, PostingItem posting) {
 *         index.computeIfAbsent(term, k -> new ArrayList<>()).add(posting);
 *     }
 * }
 */
class InvertedIndex {
    constructor() {
        // 【JavaScript 对象就是 HashMap】
        // 空对象 {} 可以当作 Map 使用
        // this.index["term"] = [PostingItem, PostingItem, ...]
        this.index = {};
    }

    /**
     * 添加一个 posting（L 使用）
     * 
     * 【调用示例】
     * index.addPosting("machine", new PostingItem({ docId: "doc-1", tf: 3 }));
     * 
     * @param {string} term - 词条（分词后的单词）
     * @param {PostingItem} posting - 倒排条目
     */
    addPosting(term, posting) {
        // 【JavaScript 特性】
        // 如果 this.index[term] 不存在（undefined），则初始化为空数组
        // 这相当于 Java 的 computeIfAbsent(term, k -> new ArrayList<>())
        if (!this.index[term]) {
            this.index[term] = [];
        }

        // 【JavaScript 数组】
        // push() 相当于 Java List 的 add()
        this.index[term].push(posting);
    }

    /**
     * 获取某个词的倒排列表（C 使用）
     * 
     * 【调用示例】
     * const postings = index.getPostingList("machine");
     * // 返回: [{ docId: "doc-1", tf: 3 }, { docId: "doc-2", tf: 1 }]
     * 
     * @param {string} term - 词条
     * @returns {PostingItem[]} 倒排列表，如果词不存在则返回空数组
     */
    getPostingList(term) {
        // 【JavaScript 特性】|| 提供默认值
        // 如果 this.index[term] 是 undefined，则返回 []
        return this.index[term] || [];
    }

    /**
     * 获取所有词条（用于调试或统计）
     * 
     * 【Java 对照】类似于 map.keySet()
     * 
     * @returns {string[]} 所有词条的数组
     */
    getAllTerms() {
        // 【JavaScript 内置方法】
        // Object.keys(obj) 返回对象所有 key 的数组
        // 类似 Java Map 的 keySet().toArray()
        return Object.keys(this.index);
    }

    /**
     * 转换为普通对象（用于存储/序列化）
     */
    toJSON() {
        return this.index;
    }

    /**
     * 从普通对象创建实例（从存储中恢复）
     * 
     * 【Java 对照】
     * public static InvertedIndex fromJSON(Map<String, List<...>> json)
     * 
     * 【JavaScript 特性】static 关键字
     * 静态方法，直接通过类名调用：InvertedIndex.fromJSON(data)
     * 而不是实例调用：index.fromJSON(data)
     */
    static fromJSON(json) {
        const instance = new InvertedIndex();
        instance.index = json;
        return instance;
    }
}

/**
 * DocStats - 文档统计信息（用于 TF-IDF / BM25 计算）
 * 
 * 【为什么需要这个？】
 * TF-IDF 和 BM25 计算需要知道：
 * - 总文档数（计算 IDF）
 * - 平均文档长度（BM25 归一化）
 * - 每个文档的长度（BM25 归一化）
 * 
 * 【数据结构示例】
 * {
 *   totalDocs: 100,
 *   avgDocLength: 150,
 *   docs: {
 *     "local-1": { length: 200, source: "local", title: "Note 1" },
 *     "local-2": { length: 100, source: "local", title: "Note 2" }
 *   }
 * }
 */
class DocStats {
    constructor() {
        this.totalDocs = 0;
        this.avgDocLength = 0;
        this.docs = {};  // docId -> { length, source, title }
    }

    /**
     * 添加文档统计（L 使用）
     * 
     * 【调用示例】
     * docStats.addDoc("doc-1", { length: 200, source: "local", title: "My Note" });
     * 
     * @param {string} docId - 文档 ID
     * @param {Object} info - 文档信息
     * @param {number} info.length - 文档长度（分词后的词数）
     * @param {string} info.source - 来源 "local" | "remote"
     * @param {string} info.title - 文档标题
     */
    addDoc(docId, { length, source, title }) {
        // 存储文档信息
        this.docs[docId] = { length, source, title };

        // 更新总文档数
        // 【JavaScript 内置方法】Object.keys(obj).length 获取对象的 key 数量
        this.totalDocs = Object.keys(this.docs).length;

        // 重新计算平均长度
        this._recalculateAvgLength();
    }

    /**
     * 私有方法：重新计算平均文档长度
     * 
     * 【JavaScript 命名约定】
     * 以下划线 _ 开头表示"私有"方法（只是约定，并非真正私有）
     * 真正的私有字段/方法用 # 开头（ES2022+），如 #recalculateAvgLength()
     */
    _recalculateAvgLength() {
        // 【JavaScript 数组方法 reduce】
        // reduce 用于"归约"数组，类似 Java Stream 的 reduce
        // 
        // 语法：array.reduce((累加器, 当前元素) => 新累加器值, 初始值)
        // 
        // 示例：[1, 2, 3].reduce((sum, n) => sum + n, 0) 
        //       第1步: sum=0, n=1, 返回 0+1=1
        //       第2步: sum=1, n=2, 返回 1+2=3
        //       第3步: sum=3, n=3, 返回 3+3=6
        //       结果: 6
        const totalLength = Object.values(this.docs)
            .reduce((sum, doc) => sum + doc.length, 0);

        // 【JavaScript 三元运算符】和 Java 一样：条件 ? 真值 : 假值
        this.avgDocLength = this.totalDocs > 0 ? totalLength / this.totalDocs : 0;
    }

    /**
     * 获取文档信息（C 使用）
     * 
     * @param {string} docId - 文档 ID
     * @returns {Object|null} 文档信息，不存在则返回 null
     */
    getDocInfo(docId) {
        return this.docs[docId] || null;
    }

    /**
     * 获取指定来源的文档 ID 列表（C 使用，用于 scope 过滤）
     * 
     * 【使用场景】
     * 用户搜索时可以选择 scope:
     * - "local": 只搜索本地文档
     * - "remote": 只搜索远程文档
     * - "all": 搜索全部
     * 
     * @param {string} source - "local" | "remote" | "all"
     * @returns {string[]} 符合条件的文档 ID 数组
     */
    getDocIdsBySource(source) {
        if (source === "all") {
            return Object.keys(this.docs);
        }

        // 【JavaScript 链式调用】类似 Java Stream API
        // Object.entries(obj) 返回 [[key, value], [key, value], ...]
        // 
        // 步骤分解：
        // 1. Object.entries({ "doc-1": {...}, "doc-2": {...} })
        //    => [["doc-1", {...}], ["doc-2", {...}]]
        // 
        // 2. .filter(([docId, info]) => info.source === source)
        //    => 只保留 source 匹配的条目
        //    => 注意这里 [docId, info] 是解构，把数组的两个元素分别赋值
        // 
        // 3. .map(([docId, _]) => docId)
        //    => 只取 docId，忽略 info（用 _ 表示不关心这个值）
        return Object.entries(this.docs)
            .filter(([docId, info]) => info.source === source)
            .map(([docId, _]) => docId);
    }

    /**
     * 转换为普通对象
     */
    toJSON() {
        return {
            totalDocs: this.totalDocs,
            avgDocLength: this.avgDocLength,
            docs: this.docs
        };
    }

    /**
     * 从普通对象创建实例
     */
    static fromJSON(json) {
        const instance = new DocStats();
        instance.totalDocs = json.totalDocs;
        instance.avgDocLength = json.avgDocLength;
        instance.docs = json.docs;
        return instance;
    }
}

// 导出多个类
// 【导入方式】
// const { PostingItem, InvertedIndex, DocStats } = require("./IndexTypes");
module.exports = { PostingItem, InvertedIndex, DocStats };
