/**
 * GoogleSearchService.js - Google Custom Search API integration
 * 
 * Free quota: 100 queries/day
 * Docs: https://developers.google.com/custom-search/v1/reference/rest/v1/cse/list
 */

"use strict";

require('dotenv').config();

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_SEARCH_ENGINE_ID = process.env.GOOGLE_SEARCH_ENGINE_ID;
const GOOGLE_API_URL = "https://www.googleapis.com/customsearch/v1";

/**
 * Execute Google search
 * @param {string} query - Search query
 * @param {Object} options
 * @param {number} options.num - Number of results (1-10, default 10)
 * @param {number} options.start - Start index for pagination (default 1)
 * @returns {Promise<Array>} Search results
 */
async function searchGoogle(query, options = {}) {
    const { num = 10, start = 1 } = options;

    if (!GOOGLE_API_KEY || !GOOGLE_SEARCH_ENGINE_ID) {
        console.error("[GoogleSearchService] Missing API_KEY or SEARCH_ENGINE_ID in .env");
        throw new Error("Google Search API not configured. Please check .env file.");
    }

    const params = new URLSearchParams({
        key: GOOGLE_API_KEY,
        cx: GOOGLE_SEARCH_ENGINE_ID,
        q: query,
        num: Math.min(num, 10).toString(),
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
            
            if (response.status === 429 || errorMessage.includes("quota")) {
                throw new Error("Google API quota exceeded (100 queries/day)");
            }
            
            throw new Error(`Google Search API error: ${errorMessage}`);
        }

        const data = await response.json();

        const results = (data.items || []).map(item => ({
            title: item.title || "Untitled",
            url: item.link || "#",
            snippet: item.snippet || "",
            source: "remote",
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
 * Check if API is configured
 * @returns {boolean}
 */
function isConfigured() {
    return !!(GOOGLE_API_KEY && GOOGLE_SEARCH_ENGINE_ID);
}

/**
 * Get configuration status (for debugging)
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
