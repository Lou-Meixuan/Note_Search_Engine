import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SearchPage from "./pages/SearchPage.jsx";
import UploadPage from "./pages/UploadPage.jsx";
import DocumentPage from "./pages/DocumentPage.jsx";
import SettingsPage from "./pages/SettingsPage";
import AccountPage from "./pages/AccountPage";

export default function App() {
    return (
        <BrowserRouter>
            <div style={{ padding: 16 }}>
                <Routes>

                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/account" element={<AccountPage />} />
                    <Route path="/" element={<SearchPage />} />
                    <Route path="/upload" element={<UploadPage />} />
                    <Route path="/doc/:id" element={<DocumentPage />} />
                    <Route path="/document/:id" element={<DocumentPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}
