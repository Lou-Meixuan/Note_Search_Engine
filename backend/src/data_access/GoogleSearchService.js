/**
 * GoogleSearchService - 调用 Google Custom Search API
 * 
 * Created by: C
 * Date: 2026-01-07
 * 
 * 功能:
 * - 使用 Google Custom Search API 搜索全网
 * - 免费配额: 每天 100 次查询
 * 
 * API 文档: https://developers.google.com/custom-search/v1/reference/rest/v1/cse/list
 */

"use strict";

// 从环境变量读取配置
require('dotenv').config();

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_SEARCH_ENGINE_ID = process.env.GOOGLE_SEARCH_ENGINE_ID;

// Google Custom Search API 端点
const GOOGLE_API_URL = "https://www.googleapis.com/customsearch/v1";

/**
 * 执行 Google 搜索
 * 
 * @param {string} query - 搜索关键词
 * @param {Object} options - 可选参数
 * @param {number} options.num - 返回结果数量 (1-10, 默认 10)
 * @param {number} options.start - 起始位置 (用于分页, 默认 1)
 * @returns {Promise<Array>} 搜索结果数组
 * 
 * 返回格式:
 * [
 *   {
 *     title: "网页标题",
 *     url: "https://...",
 *     snippet: "网页摘要...",
 *     source: "remote"
 *   },
 *   ...
 * ]
 */
async function searchGoogle(query, options = {}) {
    const { num = 10, start = 1 } = options;

    // 检查配置
    if (!GOOGLE_API_KEY || !GOOGLE_SEARCH_ENGINE_ID) {
        console.error("[GoogleSearchService] Missing API_KEY or SEARCH_ENGINE_ID in .env");
        throw new Error("Google Search API not configured. Please check .env file.");
    }

    // 构建 URL
    const params = new URLSearchParams({
        key: GOOGLE_API_KEY,
        cx: GOOGLE_SEARCH_ENGINE_ID,
        q: query,
        num: Math.min(num, 10).toString(),  // Google API 最多返回 10 条
        start: start.toString(),
    });

    const url = `${GOOGLE_API_URL}?${params.toString()}`;

    console.log(`[GoogleSearchService] Searching: "${query}"`);

    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.error?.message || `HTTP ${response.status}`;
            console.error("[GoogleSearchService] API Error:", errorMessage);
            
            // 检查是否超过配额
            if (response.status === 429 || errorMessage.includes("quota")) {
                throw new Error("Google API 免费配额已用完 (每天 100 次)");
            }
            
            throw new Error(`Google Search API error: ${errorMessage}`);
        }

        const data = await response.json();

        // 解析结果
        const results = (data.items || []).map(item => ({
            title: item.title || "Untitled",
            url: item.link || "#",
            snippet: item.snippet || "",
            source: "remote",
            // 额外信息 (可选)
            displayLink: item.displayLink,
            formattedUrl: item.formattedUrl,
        }));

        console.log(`[GoogleSearchService] Found ${results.length} results`);

        return results;

    } catch (error) {
        console.error("[GoogleSearchService] Fetch error:", error.message);
        throw error;
    }
}

/**
 * 检查 API 配置是否有效
 * 
 * @returns {boolean} 是否已配置
 */
function isConfigured() {
    return !!(GOOGLE_API_KEY && GOOGLE_SEARCH_ENGINE_ID);
}

/**
 * 获取配置状态（用于调试）
 */
function getConfigStatus() {
    return {
        hasApiKey: !!GOOGLE_API_KEY,
        hasSearchEngineId: !!GOOGLE_SEARCH_ENGINE_ID,
        apiKeyPrefix: GOOGLE_API_KEY ? GOOGLE_API_KEY.substring(0, 10) + "..." : null,
    };
}

module.exports = {
    searchGoogle,
    isConfigured,
    getConfigStatus,
};

