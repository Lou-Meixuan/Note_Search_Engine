/**
 * UploadModal.jsx - File upload modal
 * 
 * Drag-and-drop file upload supporting TXT, MD, PDF, DOCX formats.
 */

import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { API } from "../config/api";
import "./UploadModal.css";

export default function UploadModal({ isOpen, onClose, onUploadSuccess }) {
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState("");
    const [tags, setTags] = useState("");
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const [dragActive, setDragActive] = useState(false);
    const { t } = useLanguage();
    const { user } = useAuth();

    if (!isOpen) return null;

    const handleFileChange = (selectedFile) => {
        setFile(selectedFile);
        setError("");

        if (selectedFile && !title) {
            const fileName = selectedFile.name.replace(/\.[^/.]+$/, "");
            setTitle(fileName);
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileChange(e.dataTransfer.files[0]);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();

        if (!file) {
            setError(t("uploadError"));
            return;
        }

        setUploading(true);
        setError("");

        try {
            const formData = new FormData();
            formData.append("file", file);
            if (title) formData.append("title", title);
            if (tags) formData.append("tags", tags);
            // Attach userId if logged in
            if (user?.uid) formData.append("userId", user.uid);

            console.log("Uploading to:", API.documentsUpload);

            const response = await fetch(API.documentsUpload, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({ error: "Server error" }));
                throw new Error(data.error || `Upload failed: ${response.status}`);
            }

            const data = await response.json();
            console.log("Upload successful:", data);

            // Success callback
            if (onUploadSuccess) {
                onUploadSuccess(data);
            }

            resetForm();
            onClose();

        } catch (err) {
            console.error("Upload error:", err);
            if (err.message === "Failed to fetch") {
                setError("Cannot connect to server. Please check your connection.");
            } else {
                setError(err.message);
            }
        } finally {
            setUploading(false);
        }
    };

    const resetForm = () => {
        setFile(null);
        setTitle("");
        setTags("");
        setError("");
    };

    const handleClose = () => {
        if (!uploading) {
            resetForm();
            onClose();
        }
    };

    return (
        <div className="modalOverlay" onClick={handleClose}>
            <div className="modalContent" onClick={(e) => e.stopPropagation()}>
                <div className="modalHeader">
                    <h2>{t("uploadTitle")}</h2>
                    <button
                        className="modalCloseBtn"
                        onClick={handleClose}
                        disabled={uploading}
                        aria-label={t("close")}
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleUpload} className="modalForm">
                    <div
                        className={`dropZone ${dragActive ? "dragActive" : ""} ${file ? "hasFile" : ""}`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        {!file ? (
                            <>
                                <svg className="uploadIcon" viewBox="0 0 24 24">
                                    <path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z" />
                                </svg>
                                <p className="dropText">{t("dragDrop")}</p>
                                <p className="dropHint">{t("or")}</p>
                                <label className="fileSelectBtn">
                                    {t("browseFiles")}
                                    <input
                                        type="file"
                                        onChange={(e) => handleFileChange(e.target.files[0])}
                                        accept=".txt,.md,.pdf,.docx"
                                        disabled={uploading}
                                        className="hiddenFileInput"
                                    />
                                </label>
                                <small className="supportedTypes">{t("supportedTypes")}</small>
                            </>
                        ) : (
                            <div className="fileSelected">
                                <svg className="fileIcon" viewBox="0 0 24 24">
                                    <path d="M6 2h9l3 3v17a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2zm8 1v4h4" />
                                </svg>
                                <div className="fileDetails">
                                    <p className="fileName">{file.name}</p>
                                    <p className="fileSize">{(file.size / 1024).toFixed(2)} KB</p>
                                </div>
                                <button
                                    type="button"
                                    className="removeFileBtn"
                                    onClick={() => setFile(null)}
                                    disabled={uploading}
                                >
                                    ×
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="formField">
                        <label htmlFor="titleInput">{t("documentTitle")}</label>
                        <input
                            id="titleInput"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={t("titlePlaceholder")}
                            disabled={uploading}
                        />
                    </div>

                    <div className="formField">
                        <label htmlFor="tagsInput">{t("tags")}</label>
                        <input
                            id="tagsInput"
                            type="text"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder={t("tagsPlaceholder")}
                            disabled={uploading}
                        />
                    </div>

                    {error && <div className="modalError">{error}</div>}

                    <div className="modalActions">
                        <button
                            type="button"
                            className="modalCancelBtn"
                            onClick={handleClose}
                            disabled={uploading}
                        >
                            {t("cancel")}
                        </button>
                        <button
                            type="submit"
                            className="modalSubmitBtn"
                            disabled={!file || uploading}
                        >
                            {uploading ? t("uploading") : t("upload")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
