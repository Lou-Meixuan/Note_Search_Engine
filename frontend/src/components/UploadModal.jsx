/**
 * UploadModal.jsx - 文件上传模态框组件
 * 
 * Created by: C
 * Date: 2026-01-07
 * 
 * 功能:
 * - 支持拖拽上传文件
 * - 支持点击 "Browse Files" 按钮选择文件
 * - 支持 txt, md, pdf, docx 格式
 * 
 * 修改记录:
 * - C: 修复 Browse Files 按钮无法触发文件选择器的问题
 *      解决方案: 使用 <label> 包裹 <input type="file">，利用原生 HTML 行为
 */

import { useState } from "react";
import "./UploadModal.css";

export default function UploadModal({ isOpen, onClose, onUploadSuccess }) {
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState("");
    const [tags, setTags] = useState("");
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const [dragActive, setDragActive] = useState(false);

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
            setError("Please select a file");
            return;
        }

        setUploading(true);
        setError("");

        try {
            const formData = new FormData();
            formData.append("file", file);
            if (title) formData.append("title", title);
            if (tags) formData.append("tags", tags);

            console.log("Uploading to: http://localhost:3001/documents/upload");

            const response = await fetch("http://localhost:3001/documents/upload", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({ error: "Server error" }));
                throw new Error(data.error || `Upload failed: ${response.status}`);
            }

            const data = await response.json();
            console.log("Upload successful:", data);

            // 成功后回调
            if (onUploadSuccess) {
                onUploadSuccess(data);
            }

            resetForm();
            onClose();

        } catch (err) {
            console.error("Upload error:", err);
            if (err.message === "Failed to fetch") {
                setError("Cannot connect to server. Please make sure the backend is running on http://localhost:3001");
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

    const supportedTypes = "txt, md, pdf, docx";

    return (
        <div className="modalOverlay" onClick={handleClose}>
            <div className="modalContent" onClick={(e) => e.stopPropagation()}>
                <div className="modalHeader">
                    <h2>Upload Document</h2>
                    <button
                        className="modalCloseBtn"
                        onClick={handleClose}
                        disabled={uploading}
                        aria-label="Close"
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
                                <p className="dropText">Drag & drop your file here</p>
                                <p className="dropHint">or</p>
                                <label className="fileSelectBtn">
                                    Browse Files
                                    <input
                                        type="file"
                                        onChange={(e) => handleFileChange(e.target.files[0])}
                                        accept=".txt,.md,.pdf,.docx"
                                        disabled={uploading}
                                        className="hiddenFileInput"
                                    />
                                </label>
                                <small className="supportedTypes">Supported: {supportedTypes}</small>
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
                        <label htmlFor="titleInput">Title (optional)</label>
                        <input
                            id="titleInput"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Auto-generated from filename"
                            disabled={uploading}
                        />
                    </div>

                    <div className="formField">
                        <label htmlFor="tagsInput">Tags (optional)</label>
                        <input
                            id="tagsInput"
                            type="text"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="e.g. notes, math, lecture"
                            disabled={uploading}
                        />
                        <small>Separate with commas</small>
                    </div>

                    {error && <div className="modalError">{error}</div>}

                    <div className="modalActions">
                        <button
                            type="button"
                            className="modalCancelBtn"
                            onClick={handleClose}
                            disabled={uploading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="modalSubmitBtn"
                            disabled={!file || uploading}
                        >
                            {uploading ? "Uploading..." : "Upload"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
