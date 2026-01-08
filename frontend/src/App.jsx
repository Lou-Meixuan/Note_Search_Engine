/**
 * App.jsx - 应用根组件
 * 
 * Modified by: C (Cheng)
 * Date: 2026-01-08
 * 
 * 修改记录:
 * - C: 添加 LanguageProvider 支持多语言切换
 * - C: 添加 ColorThemeProvider 支持颜色主题预设（包含 Light/Dark 变体）
 * - C: 添加 AuthProvider 支持 Firebase 用户认证
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
