/**
 * CreateDocumentModal.jsx - New document creation modal
 * 
 * Create text/markdown documents with title, content, and tags.
 */

import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { API } from "../config/api";
import "./CreateDocumentModal.css";

export default function CreateDocumentModal({ isOpen, onClose, onCreateSuccess }) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [tags, setTags] = useState("");
    const [fileType, setFileType] = useState("txt");
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState("");
    const { t } = useLanguage();
    const { user } = useAuth();

    if (!isOpen) return null;

    const handleCreate = async (e) => {
        e.preventDefault();

        if (!title.trim()) {
            setError("Title cannot be empty");
            return;
        }

        if (!content.trim()) {
            setError("Content cannot be empty");
            return;
        }

        setCreating(true);
        setError("");

        try {
            // Create a text file blob
            const blob = new Blob([content], { type: 'text/plain' });
            const file = new File([blob], `${title}.${fileType}`, {
                type: fileType === 'md' ? 'text/markdown' : 'text/plain'
            });

            const formData = new FormData();
            formData.append("file", file);
            formData.append("title", title.trim());
            if (tags) formData.append("tags", tags);
            // Attach userId if logged in
            if (user?.uid) formData.append("userId", user.uid);

            const response = await fetch(API.documentsUpload, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({ error: "Server error" }));
                throw new Error(data.error || `Create failed: ${response.status}`);
            }

            const data = await response.json();
            console.log("Create successful:", data);

            if (onCreateSuccess) {
                onCreateSuccess(data);
            }

            resetForm();
            onClose();

        } catch (err) {
            console.error("Create error:", err);
            if (err.message === "Failed to fetch") {
                setError("Cannot connect to server. Please check your connection.");
            } else {
                setError(err.message);
            }
        } finally {
            setCreating(false);
        }
    };

    const resetForm = () => {
        setTitle("");
        setContent("");
        setTags("");
        setFileType("txt");
        setError("");
    };

    const handleClose = () => {
        if (!creating) {
            resetForm();
            onClose();
        }
    };

    return (
        <div className="modalOverlay" onClick={handleClose}>
            <div className="createModalContent" onClick={(e) => e.stopPropagation()}>
                <div className="modalHeader">
                    <h2>Create New Document</h2>
                    <button
                        className="modalCloseBtn"
                        onClick={handleClose}
                        disabled={creating}
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleCreate} className="createForm">
                    <div className="formField">
                        <label htmlFor="createTitleInput">Title *</label>
                        <input
                            id="createTitleInput"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter document title"
                            disabled={creating}
                            required
                        />
                    </div>

                    <div className="formField">
                        <label htmlFor="createFileTypeInput">File Type</label>
                        <select
                            id="createFileTypeInput"
                            value={fileType}
                            onChange={(e) => setFileType(e.target.value)}
                            disabled={creating}
                        >
                            <option value="txt">Text (.txt)</option>
                            <option value="md">Markdown (.md)</option>
                        </select>
                    </div>

                    <div className="formField">
                        <label htmlFor="createContentInput">Content *</label>
                        <textarea
                            id="createContentInput"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder={fileType === 'md' ? "Enter markdown content...\n\n# Heading\n\n**bold** *italic*\n\n- List item" : "Enter document content"}
                            disabled={creating}
                            rows={15}
                            required
                        />
                    </div>

                    <div className="formField">
                        <label htmlFor="createTagsInput">Tags</label>
                        <input
                            id="createTagsInput"
                            type="text"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="e.g. work, important, draft"
                            disabled={creating}
                        />
                    </div>

                    {error && <div className="modalError">{error}</div>}

                    <div className="modalActions">
                        <button
                            type="button"
                            className="modalCancelBtn"
                            onClick={handleClose}
                            disabled={creating}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="modalSubmitBtn"
                            disabled={creating}
                        >
                            {creating ? "Creating..." : "Create Document"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
