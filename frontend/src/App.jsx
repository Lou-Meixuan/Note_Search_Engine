/**
 * App.jsx - Root application component
 * 
 * Sets up routing and global context providers:
 * - AuthProvider: Firebase authentication
 * - LanguageProvider: Multi-language support
 * - ColorThemeProvider: Theme customization
 */

import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext";
import { ColorThemeProvider } from "./context/ColorThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { API_BASE_URL } from "./config/api";
import LoginPage from "./pages/LoginPage";
import SearchPage from "./pages/SearchPage.jsx";
import UploadPage from "./pages/UploadPage.jsx";
import DocumentPage from "./pages/DocumentPage.jsx";
import SettingsPage from "./pages/SettingsPage";
import AccountPage from "./pages/AccountPage";

export default function App() {
    // Keep Render backend alive (ping every 10 minutes)
    // Render free tier sleeps after 15 min inactivity, this prevents cold starts
    useEffect(() => {
        const pingBackend = () => {
            fetch(`${API_BASE_URL}/health`)
                .then(() => console.log("[KeepAlive] Backend pinged"))
                .catch(() => console.log("[KeepAlive] Backend ping failed (will retry)"));
        };

        // Ping immediately on app load
        pingBackend();

        // Then ping every 10 minutes (600000ms)
        const interval = setInterval(pingBackend, 10 * 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    // Cleanup anonymous user's temporary documents when closing the page
    useEffect(() => {
        const cleanupSessionDocuments = () => {
            const sessionDocIds = JSON.parse(sessionStorage.getItem('sessionDocIds') || '[]');
            
            if (sessionDocIds.length === 0) return;

            console.log('[Cleanup] Deleting temporary documents:', sessionDocIds);

            // Use sendBeacon for reliable cleanup during page unload
            // sendBeacon sends a POST request that completes even after page closes
            sessionDocIds.forEach(docId => {
                // sendBeacon only supports POST, so we use a cleanup endpoint
                navigator.sendBeacon(
                    `${API_BASE_URL}/documents/${docId}/cleanup`,
                    JSON.stringify({ action: 'delete' })
                );
            });

            // Clear the session storage
            sessionStorage.removeItem('sessionDocIds');
        };

        // Listen for page close/refresh
        window.addEventListener('beforeunload', cleanupSessionDocuments);

        return () => {
            window.removeEventListener('beforeunload', cleanupSessionDocuments);
        };
    }, []);

    return (
        <AuthProvider>
            <LanguageProvider>
                <ColorThemeProvider>
        <BrowserRouter>
                <Routes>
                            <Route path="/" element={<LoginPage />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/home" element={<SearchPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/account" element={<AccountPage />} />
                    <Route path="/upload" element={<UploadPage />} />
                    <Route path="/doc/:id" element={<DocumentPage />} />
                    <Route path="/document/:id" element={<DocumentPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
        </BrowserRouter>
                </ColorThemeProvider>
            </LanguageProvider>
        </AuthProvider>
    );
}
