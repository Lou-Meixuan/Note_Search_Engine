/**
 * App.jsx - Root application component
 * 
 * Sets up routing and global context providers:
 * - AuthProvider: Firebase authentication
 * - LanguageProvider: Multi-language support
 * - ColorThemeProvider: Theme customization
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext";
import { ColorThemeProvider } from "./context/ColorThemeContext";
import { AuthProvider } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import SearchPage from "./pages/SearchPage.jsx";
import UploadPage from "./pages/UploadPage.jsx";
import DocumentPage from "./pages/DocumentPage.jsx";
import SettingsPage from "./pages/SettingsPage";
import AccountPage from "./pages/AccountPage";

export default function App() {
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
