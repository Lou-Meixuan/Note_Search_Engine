// backend/src/data_access/test_tokenizer.js
// 中文注释：Tokenizer 测试脚本
// 运行：node backend/src/data_access/test_tokenizer.js
// 目标：验证 Pipeline（Model -> Post -> Final）确实生效 + query 模式召回（recall）

"use strict";

const { tokenize } = require("./tokenizer/Model");
const { tokenizeFinal, cosineSimilarity } = require("./tokenizer/Tokens");

/* =========================================================
 * Test 0: 快速 sanity check（对比 Model-only vs Final）
 * ========================================================= */
console.log("\n================ TEST 0: MODEL vs FINAL (SANITY) =================\n");

const text0 =
    "我喜欢UofT的CSC207，明天去Robarts学习！Video-edit_engine/2026，我喜欢UofT的CSC207是的是的是的我喜欢UofT的CSC207我喜欢UofT的CSC207";

const model0 = tokenize(text0, { output: "stats" });
const final0 = tokenizeFinal(text0, {
    output: "stats",
    postOptions: {
        maxTokens: 5000,
        maxTokenLength: 64,
        dropNoiseTokens: true,

        removeStopwords: false,
        removeZhStopwords: false,
    },
});

console.log("Text:", text0);
console.log("\n[Model-only]");
console.log("Total tokens:", model0.length);
console.log("Unique terms:", model0.uniqueTerms);

console.log("\n[Final pipeline]");
console.log("Total tokens:", final0.length);
console.log("Unique terms:", final0.uniqueTerms);


/* =========================================================
 * Test 1: 基础 Tokenizer 测试（中英混合 + bigram）
 * ========================================================= */
console.log("\n================ TEST 1: BASIC TOKENIZER (FINAL) =================\n");

const stats1 = tokenizeFinal(text0, {
    output: "stats",
    mode: "document",
    postOptions: {
        maxTokens: 5000,
        maxTokenLength: 64,
        dropNoiseTokens: true,
        removeStopwords: false,
        removeZhStopwords: false,
    },
});

console.log("TF:", stats1.tf);
console.log("Total tokens:", stats1.length);
console.log("Unique terms:", stats1.uniqueTerms);


/* =========================================================
 * Test 2: TF 是否正确（term frequency）
 * ========================================================= */
console.log("\n================ TEST 2: TF WEIGHTING (FINAL) ====================\n");

const text2 = `
我喜欢UofT的CSC207。
我真的很喜欢UofT的CSC207。
CSC207对我来说很重要。
`;

const stats2 = tokenizeFinal(text2, {
    output: "stats",
    mode: "document",
    postOptions: {
        maxTokens: 5000,
        maxTokenLength: 64,
        dropNoiseTokens: true,
        removeStopwords: false,
        removeZhStopwords: false,
    },
});

console.log("Text:", text2.trim());
console.log("TF(csc207):", stats2.tf["csc207"]);
console.log("TF(uoft):", stats2.tf["uoft"]);
console.log("TF(full):", stats2.tf);


/* =========================================================
 * Test 3: Similarity Test（query 模式：CJK single+bigram 融合）
 * ========================================================= */
console.log("\n================ TEST 3: SIMILARITY (QUERY MODE + FINAL) ======================\n");

const docs = [
    "我喜欢UofT",
    "Robarts图书馆是一个好地方。",
    "CSC207是UofT计算机系的一门核心课程。",
    "中文课程。",
    "日语进阶课程。",
    "zhejiang 图书馆"
];

const query = "书";

// 文档向量：document 模式
const docStats = docs.map((d) =>
    tokenizeFinal(d, {
        output: "stats",
        mode: "document",
        postOptions: {
            maxTokens: 5000,
            maxTokenLength: 64,
            dropNoiseTokens: true,
            removeStopwords: false,
            removeZhStopwords: false,
        },
    })
);

// 查询向量：query 模式（single+bigram 融合）
const queryStats = tokenizeFinal(query, {
    output: "stats",
    mode: "query",
    queryBigramWeight: 1,
    postOptions: {
        maxTokens: 1000,
        maxTokenLength: 64,
        dropNoiseTokens: true,
        removeStopwords: false,
        removeZhStopwords: false,
    },
});

console.log("Query:", query);
console.log("Query tokens:", queryStats.tokens);
console.log("\nSimilarity scores:");

docs.forEach((doc, i) => {
    const score = cosineSimilarity(docStats[i].tf, queryStats.tf);
    console.log(`Doc ${i} score: ${score.toFixed(4)}`);
    console.log("  ", doc);
});


/* =========================================================
 * Test X: FORCE POST EFFECT
 * ========================================================= */
console.log("\n================ TEST X: FORCE POST EFFECT ======================\n");

const noisy = "hello ____ !!!! aaaaaaaa base64like_" + "x".repeat(200);

const modelX = tokenize(noisy, { output: "tokens" });
const finalX = tokenizeFinal(noisy, {
    output: "tokens",
    postOptions: {
        maxTokenLength: 20,
        dropNoiseTokens: true,
        removeStopwords: false,
        removeZhStopwords: false,
    },
});

console.log("Model tokens:", modelX);
console.log("Final tokens:", finalX);

console.log("\n================ ALL TESTS FINISHED ======================\n");
