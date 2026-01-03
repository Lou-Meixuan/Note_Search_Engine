import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SearchPage from "./pages/SearchPage.jsx";
import UploadPage from "./pages/UploadPage.jsx";
import DocumentPage from "./pages/DocumentPage.jsx";
import NavBar from "./components/NavBar.jsx";

export default function App() {
    return (
        <BrowserRouter>
            <NavBar />
            <div style={{ padding: 16 }}>
                <Routes>
                    <Route path="/" element={<SearchPage />} />
                    <Route path="/upload" element={<UploadPage />} />
                    <Route path="/doc/:id" element={<DocumentPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}
