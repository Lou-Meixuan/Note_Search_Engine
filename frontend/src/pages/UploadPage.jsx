/**
 * UploadPage.jsx - Standalone upload page
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../config/api";
import "./UploadPage.css";

export default function UploadPage() {
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState("");
    const [tags, setTags] = useState("");
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        setError("");
        setSuccess("");

        // Auto-generate title from filename
        if (selectedFile && !title) {
            const fileName = selectedFile.name.replace(/\.[^/.]+$/, "");
            setTitle(fileName);
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
        setSuccess("");

        try {
            const formData = new FormData();
            formData.append("file", file);
            if (title) formData.append("title", title);
            if (tags) formData.append("tags", tags);

            const response = await fetch(API.documentsUpload, {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Upload failed");
            }

            setSuccess(`Successfully uploaded: ${data.title}`);
            setFile(null);
            setTitle("");
            setTags("");

            // Reset file input
            e.target.reset();

            // Redirect to document after 3 seconds
            setTimeout(() => {
                navigate(`/document/${data.documentId}`);
            }, 2000);

        } catch (err) {
            setError(err.message);
        } finally {
            setUploading(false);
        }
    };

    const supportedTypes = "txt, md, pdf, docx";

    return (
        <div className="uploadPage">
            <div className="uploadContainer">
                <h2>Upload Local Document</h2>
                <p className="uploadHint">Upload your notes and documents to search them later</p>

                <form onSubmit={handleUpload} className="uploadForm">
                    <div className="formGroup">
                        <label htmlFor="fileInput">Select File</label>
                        <input
                            id="fileInput"
                            type="file"
                            onChange={handleFileChange}
                            accept=".txt,.md,.pdf,.docx"
                            disabled={uploading}
                        />
                        <small>Supported formats: {supportedTypes}</small>
                    </div>

                    {file && (
                        <div className="fileInfo">
                            <p><strong>Selected:</strong> {file.name}</p>
                            <p><strong>Size:</strong> {(file.size / 1024).toFixed(2)} KB</p>
                        </div>
                    )}

                    <div className="formGroup">
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

                    <div className="formGroup">
                        <label htmlFor="tagsInput">Tags (optional)</label>
                        <input
                            id="tagsInput"
                            type="text"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="e.g. notes, math, lecture"
                            disabled={uploading}
                        />
                        <small>Separate tags with commas</small>
                    </div>

                    {error && <div className="errorMessage">{error}</div>}
                    {success && <div className="successMessage">{success}</div>}

                    <button
                        type="submit"
                        className="uploadButton"
                        disabled={!file || uploading}
                    >
                        {uploading ? "Uploading..." : "Upload Document"}
                    </button>
                </form>

                <button
                    className="backButton"
                    onClick={() => navigate("/home")}
                    disabled={uploading}
                >
                    Back to Home
                </button>
            </div>
        </div>
    );
}
