/**
 * API 配置文件
 * 
 * Created by: C
 * Date: 2026-01-08
 * 
 * 说明:
 * - 开发环境使用本地地址 http://localhost:3001
 * - 生产环境使用 VITE_API_URL 环境变量
 * 
 * 部署时在 Vercel/Netlify 设置环境变量:
 * VITE_API_URL=https://your-backend-url.onrender.com
 */

// API 基础 URL
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// API 端点
export const API = {
    // 文档相关
    documents: `${API_BASE_URL}/documents`,
    documentsUpload: `${API_BASE_URL}/documents/upload`,
    documentById: (id) => `${API_BASE_URL}/documents/${id}`,
    documentFile: (id) => `${API_BASE_URL}/documents/${id}/file`,
    
    // 搜索
    search: `${API_BASE_URL}/search`,
    
    // 标签
    tags: `${API_BASE_URL}/tags`,
};

export default API;

