/**
 * api.js - API configuration
 * 
 * Provides centralized API endpoint management.
 * Uses VITE_API_URL environment variable in production,
 * falls back to localhost:3001 in development.
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const API = {
    // Documents
    documents: `${API_BASE_URL}/documents`,
    documentsUpload: `${API_BASE_URL}/documents/upload`,
    documentById: (id) => `${API_BASE_URL}/documents/${id}`,
    documentFile: (id) => `${API_BASE_URL}/documents/${id}/file`,
    
    // Search
    search: `${API_BASE_URL}/search`,
    
    // Tags
    tags: `${API_BASE_URL}/tags`,
};

export default API;
