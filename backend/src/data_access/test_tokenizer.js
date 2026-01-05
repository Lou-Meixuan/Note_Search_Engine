const { tokenize } = require("./tokenizer/Model");

/* =========================================================
 * Test 1: 基础 Tokenizer 测试（中英混合 + bigram）
 * ========================================================= */
console.log("\n================ TEST 1: BASIC TOKENIZER ================\n");

const text1 =
    "我喜欢UofT的CSC207，明天去Robarts学习！Video-edit_engine/2026，我喜欢UofT的CSC207是的是的是的我喜欢UofT的CSC207我喜欢UofT的CSC207";

const stats1 = tokenize(text1, {
    output: "stats",
});

console.log("Text:", text1);
console.log("TF:", stats1.tf);
console.log("Total tokens:", stats1.length);
console.log("Unique terms:", stats1.uniqueTerms);

/*
期望观察点：
- 中文是 bigram（如 我喜 / 喜欢 / 明天 / 天去）
- 英文是 word（uoft / csc207 / robarts）
- length > uniqueTerms
*/


/* =========================================================
 * Test 2: TF（词频）是否正确（重复 = 权重更高）
 * ========================================================= */
console.log("\n================ TEST 2: TF WEIGHTING ====================\n");

const text2 = `
我喜欢UofT的CSC207。
我真的很喜欢UofT的CSC207。
CSC207对我来说很重要。
`;

const stats2 = tokenize(text2, {
    output: "stats",
});

console.log("Text:", text2.trim());
console.log("TF:", stats2.tf);
console.log("TF(csc207):", stats2.tf["csc207"]);
console.log("TF(uoft):", stats2.tf["uoft"]);

/*
期望观察点：
- csc207 的 TF >= 3
- uoft 的 TF >= 2
- 说明 tokenizer 输出可直接用于 TF-IDF / BM25
*/


/* =========================================================
 * Test 3: Similarity Test（搜索结果是否符合直觉）
 * ========================================================= */

// 极简 cosine similarity（基于 TF）
function cosineSimilarity(tf1, tf2) {
    let dot = 0;
    let normA = 0;
    let normB = 0;

    for (const term in tf1) {
        const a = tf1[term];
        normA += a * a;
        if (term in tf2) {
            dot += a * tf2[term];
        }
    }

    for (const term in tf2) {
        const b = tf2[term];
        normB += b * b;
    }

    if (normA === 0 || normB === 0) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

console.log("\n================ TEST 3: SIMILARITY ======================\n");

// 三个文档
const docs = [
    "我喜欢UofT",
    "Robarts图书馆是一个好地方。",
    "CSC207是UofT计算机系的一门核心课程。",
    "中文课程。",
    "日语进阶课程。",
    "zhejiang 图书馆"
];

// 一个 query
const query = "书";

const docStats = docs.map(d =>
    tokenize(d, { output: "stats" })
);
const queryStats = tokenize(query, { output: "stats" });

console.log("Query:", query);
console.log("\nSimilarity scores:");

docs.forEach((doc, i) => {
    const score = cosineSimilarity(docStats[i].tf, queryStats.tf);
    console.log(`Doc ${i} score: ${score.toFixed(4)}`);
    console.log("  ", doc);
});

console.log("\n================ ALL TESTS FINISHED ======================\n");
